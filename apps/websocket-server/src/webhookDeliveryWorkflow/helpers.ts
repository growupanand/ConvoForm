import { signPayload } from "@convoform/common";

const INTERNAL_REQUEST_TIMEOUT_MS = 15_000;
const DELIVERY_TIMEOUT_MS = 25_000;
const MAX_STORED_ERROR_LENGTH = 500;

export interface SignedWebhookRequest {
  deliveryId: string;
  url: string;
  method: "POST";
  headers: Record<string, string>;
  body: string;
}

export interface WebhookDeliveryAttempt {
  statusCode: number;
  latencyMs: number;
  attempt: number;
}

export interface WebhookDeliveryResultPayload {
  deliveryId: string;
  success: boolean;
  statusCode: number | null;
  latencyMs: number | null;
  error: string | null;
  attempts: number;
}

export interface ParsedWebhookDeliveryFailure {
  statusCode: number | null;
  latencyMs: number | null;
  attempts: number;
  error: string;
}

interface SendSignedWebhookOptions {
  attempt: number;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

/**
 * Fetch a fresh signed request from the main app.
 *
 * The Worker never holds DB credentials or endpoint secrets; the main app
 * rebuilds the payload, re-checks the URL for SSRF and signs the body.
 */
export async function loadSignedWebhookRequest({
  baseUrl,
  deliveryId,
  secret,
  fetchImpl = fetch,
}: {
  baseUrl: string;
  deliveryId: string;
  secret: string;
  fetchImpl?: typeof fetch;
}): Promise<SignedWebhookRequest> {
  const body = JSON.stringify({ deliveryId });
  const response = await fetchImpl(
    `${stripTrailingSlash(baseUrl)}/api/internal/webhook-delivery/${encodeURIComponent(
      deliveryId,
    )}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-ConvoForm-Signature": await signPayload(body, secret),
      },
      body,
      signal: AbortSignal.timeout(INTERNAL_REQUEST_TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load signed webhook request (HTTP ${response.status})`,
    );
  }

  return (await response.json()) as SignedWebhookRequest;
}

/**
 * Send a signed request.
 *
 * Redirects are never followed and any non-2xx response throws so the
 * Workflow step retries it.
 */
export async function sendSignedWebhookRequest(
  request: SignedWebhookRequest,
  {
    attempt,
    fetchImpl = fetch,
    timeoutMs = DELIVERY_TIMEOUT_MS,
  }: SendSignedWebhookOptions,
): Promise<WebhookDeliveryAttempt> {
  const startedAt = Date.now();

  try {
    const response = await fetchImpl(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });

    const latencyMs = Date.now() - startedAt;

    // We only need the status code. Discard the body so we never read or
    // store a responder's payload.
    response.body?.cancel().catch(() => {
      // The responder body is intentionally discarded.
    });

    if (response.status < 200 || response.status >= 300) {
      throw new WebhookDeliveryAttemptError({
        attempt,
        statusCode: response.status,
        latencyMs,
        reason: `HTTP ${response.status}${
          response.statusText ? ` ${response.statusText}` : ""
        }`,
      });
    }

    return { statusCode: response.status, latencyMs, attempt };
  } catch (error) {
    if (error instanceof WebhookDeliveryAttemptError) {
      throw error;
    }

    throw new WebhookDeliveryAttemptError({
      attempt,
      statusCode: null,
      latencyMs: Date.now() - startedAt,
      // Never persist the endpoint URL: it can contain its own secret token.
      reason: formatDeliveryError(error, [request.url]),
    });
  }
}

/**
 * Report the final outcome through the signed internal route.
 */
export async function reportWebhookDeliveryResult({
  baseUrl,
  secret,
  result,
  fetchImpl = fetch,
}: {
  baseUrl: string;
  secret: string;
  result: WebhookDeliveryResultPayload;
  fetchImpl?: typeof fetch;
}): Promise<void> {
  const body = JSON.stringify(result);
  const response = await fetchImpl(
    `${stripTrailingSlash(baseUrl)}/api/internal/webhook-delivery-result`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-ConvoForm-Signature": await signPayload(body, secret),
      },
      body,
      signal: AbortSignal.timeout(INTERNAL_REQUEST_TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to report webhook delivery result (HTTP ${response.status})`,
    );
  }
}

/**
 * Convert the error thrown by an exhausted `step.do("deliver")` into the
 * columns recorded on `WebhookDelivery`.
 *
 * Cloudflare persists only the error message between retry attempts, so the
 * useful values are encoded in the message by `WebhookDeliveryAttemptError`.
 */
export function parseWebhookDeliveryFailure(
  error: unknown,
  fallbackAttempts: number,
): ParsedWebhookDeliveryFailure {
  const message =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const match = message.match(
    /status=(none|\d+)\s+latency=(none|\d+)\s+attempt=(\d+)(?:\s+reason=(.*))?/s,
  );

  if (!match) {
    return {
      statusCode: null,
      latencyMs: null,
      attempts: fallbackAttempts,
      error: truncateError(message),
    };
  }

  const [, status, latency, attempt, reason] = match;

  return {
    statusCode: status === "none" ? null : Number(status),
    latencyMs: latency === "none" ? null : Number(latency),
    attempts: Number(attempt),
    error: truncateError(reason || message),
  };
}

export class WebhookDeliveryAttemptError extends Error {
  readonly statusCode: number | null;
  readonly latencyMs: number;
  readonly attempt: number;

  constructor({
    attempt,
    statusCode,
    latencyMs,
    reason,
  }: {
    attempt: number;
    statusCode: number | null;
    latencyMs: number;
    reason: string;
  }) {
    super(
      `webhook_attempt_failed status=${
        statusCode ?? "none"
      } latency=${latencyMs} attempt=${attempt} reason=${truncateError(reason)}`,
    );
    this.name = "WebhookDeliveryAttemptError";
    this.statusCode = statusCode;
    this.latencyMs = latencyMs;
    this.attempt = attempt;
  }
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function truncateError(error: string): string {
  return (
    error.replace(/\s+/g, " ").trim().slice(0, MAX_STORED_ERROR_LENGTH) ||
    "Webhook delivery failed"
  );
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

  return truncateError(message);
}
