import { analytics } from "@convoform/analytics";
import { db, eq } from "@convoform/db";
import {
  type WebhookDeliveryResult,
  webhookDelivery,
} from "@convoform/db/src/schema";
import type { ActionContext } from "../../types/actionContextType";
import {
  type SignedWebhookRequest,
  getSignedWebhookRequest,
} from "./getSignedWebhookRequest";
import { reportWebhookDeliveryResult } from "./reportWebhookDeliveryResult";

const DELIVERY_TIMEOUT_MS = 30_000;
const MAX_STORED_ERROR_LENGTH = 500;
// First attempt immediately, then two in-process retries.
const DEFAULT_RETRY_DELAYS_MS = [0, 1_000, 5_000];

export interface WebhookAttemptResult {
  success: boolean;
  statusCode: number | null;
  latencyMs: number;
  error: string | null;
}

export interface SendWebhookOptions {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  retryDelaysMs?: number[];
  sleep?: (ms: number) => Promise<void>;
}

/**
 * Self-host delivery adapter.
 *
 * Best-effort: one initial attempt plus two in-process retries after 1s and
 * 5s. Cloud deployments get the durable multi-hour retry window from the
 * Cloudflare Workflow adapter added in a later PR.
 */
export async function deliverWebhook(
  deliveryId: string,
  ctx: ActionContext = { db },
  options: SendWebhookOptions = {},
): Promise<void> {
  let request: SignedWebhookRequest;

  try {
    request = await getSignedWebhookRequest(deliveryId, ctx);
  } catch (error) {
    await safeReportResult({
      deliveryId,
      success: false,
      statusCode: null,
      latencyMs: null,
      error: formatDeliveryError(error),
      attempts: 0,
    });
    return;
  }

  try {
    await ctx.db
      .update(webhookDelivery)
      .set({ status: "delivering", updatedAt: new Date() })
      .where(eq(webhookDelivery.id, deliveryId));
  } catch (error) {
    // Status reporting must not stop the delivery attempt itself.
    console.error("Failed to mark webhook delivery as delivering", error);
  }

  const { result, attempts } = await sendWebhookWithRetries(request, options);

  await safeReportResult({
    deliveryId,
    success: result.success,
    statusCode: result.statusCode,
    latencyMs: result.latencyMs,
    error: result.error,
    attempts,
  });
}

export async function sendWebhookWithRetries(
  request: SignedWebhookRequest,
  {
    fetchImpl = fetch,
    timeoutMs = DELIVERY_TIMEOUT_MS,
    retryDelaysMs = DEFAULT_RETRY_DELAYS_MS,
    sleep = defaultSleep,
  }: SendWebhookOptions = {},
): Promise<{ result: WebhookAttemptResult; attempts: number }> {
  let attempts = 0;
  let lastResult: WebhookAttemptResult = {
    success: false,
    statusCode: null,
    latencyMs: 0,
    error: "Webhook delivery was not attempted",
  };

  for (const delayMs of retryDelaysMs) {
    if (delayMs > 0) {
      await sleep(delayMs);
    }

    attempts++;
    lastResult = await sendWebhookAttempt(request, {
      fetchImpl,
      timeoutMs,
    });

    if (lastResult.success) {
      break;
    }
  }

  return { result: lastResult, attempts };
}

export async function sendWebhookAttempt(
  request: SignedWebhookRequest,
  {
    fetchImpl = fetch,
    timeoutMs = DELIVERY_TIMEOUT_MS,
  }: Pick<SendWebhookOptions, "fetchImpl" | "timeoutMs"> = {},
): Promise<WebhookAttemptResult> {
  const startedAt = Date.now();

  try {
    const response = await fetchImpl(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      // Never follow redirects: a 3xx response is a failed attempt.
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });

    const latencyMs = Date.now() - startedAt;

    // We only need the status code. Discard the body so we never read or store
    // a responder's payload.
    response.body?.cancel().catch(() => {
      // The responder body is intentionally discarded.
    });

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        statusCode: response.status,
        latencyMs,
        error: null,
      };
    }

    return {
      success: false,
      statusCode: response.status,
      latencyMs,
      error: `HTTP ${response.status}${
        response.statusText ? ` ${response.statusText}` : ""
      }`,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: null,
      latencyMs: Date.now() - startedAt,
      // Never persist the endpoint URL: it can contain its own secret token.
      error: formatDeliveryError(error, [request.url]),
    };
  }
}

async function safeReportResult(input: WebhookDeliveryResult) {
  try {
    await reportWebhookDeliveryResult(input);
  } catch (error) {
    console.error("Failed to record webhook delivery result", error);
    try {
      await analytics.captureException(
        error instanceof Error ? error : new Error(String(error)),
        input.deliveryId,
      );
    } catch {
      // Best-effort observability only.
    }
  }
}

function formatDeliveryError(
  error: unknown,
  redactedValues: string[] = [],
): string {
  let message =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);

  for (const value of redactedValues) {
    if (value) {
      message = message.split(value).join("[redacted]");
    }
  }

  return (
    message.replace(/\s+/g, " ").trim().slice(0, MAX_STORED_ERROR_LENGTH) ||
    "Webhook delivery failed"
  );
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
