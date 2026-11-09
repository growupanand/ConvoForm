import { eq } from "@convoform/db";
import {
  type WebhookDeliveryResult,
  webhookDelivery,
} from "@convoform/db/src/schema";
import type { ActionContext } from "../../types/actionContextType";
import { reportWebhookDeliveryResult } from "./reportWebhookDeliveryResult";

const CLOUDFLARE_API_BASE_URL = "https://api.cloudflare.com/client/v4";
const CLOUDFLARE_API_TIMEOUT_MS = 10_000;
const MAX_STORED_ERROR_LENGTH = 500;
/** Cloudflare REST error code for "an instance with this ID already exists". */
const INSTANCE_ALREADY_EXISTS_CODE = 10405;

export interface CloudflareWorkflowConfig {
  accountId: string;
  apiToken: string;
  workflowName: string;
}

export interface CloudflareWebhookDeliveryOptions {
  /** Pass `null` to force the "not configured" path (used by tests). */
  config?: CloudflareWorkflowConfig | null;
  fetchImpl?: typeof fetch;
  /** Injectable for tests; defaults to the signed internal result route. */
  reportResult?: (input: WebhookDeliveryResult) => Promise<void>;
}

interface CloudflareApiError {
  code?: number;
  message?: string;
}

interface CloudflareApiResponse<T> {
  success?: boolean;
  errors?: CloudflareApiError[];
  result?: T;
}

type RuntimeEnv = Record<string, string | undefined>;

/**
 * Read the Cloudflare Workflow configuration from the environment.
 *
 * All three values are required: with any of them missing the deployment uses
 * the best-effort direct adapter from PR 1.
 */
export function getCloudflareWorkflowConfig(
  runtimeEnv: RuntimeEnv = process.env,
): CloudflareWorkflowConfig | null {
  const accountId = runtimeEnv.CF_ACCOUNT_ID?.trim();
  const apiToken = runtimeEnv.CF_API_TOKEN?.trim();
  const workflowName = runtimeEnv.CF_WEBHOOK_WORKFLOW_NAME?.trim();

  if (!accountId || !apiToken || !workflowName) {
    return null;
  }

  return { accountId, apiToken, workflowName };
}

export function isCloudflareWebhookDeliveryConfigured(
  runtimeEnv: RuntimeEnv = process.env,
): boolean {
  return getCloudflareWorkflowConfig(runtimeEnv) !== null;
}

/**
 * Cloud delivery adapter.
 *
 * Creates a Cloudflare Workflow instance whose `instance_id` is the delivery
 * id, so retried instance creation is idempotent. The Worker owns the retry
 * schedule and reports the final outcome back through the signed internal
 * result route; this adapter only starts the instance.
 */
export async function deliverWebhookWithCloudflare(
  deliveryId: string,
  ctx: ActionContext,
  options: CloudflareWebhookDeliveryOptions = {},
): Promise<void> {
  const config =
    options.config !== undefined
      ? options.config
      : getCloudflareWorkflowConfig();
  const reportResult = options.reportResult ?? reportWebhookDeliveryResult;

  if (!config) {
    await reportFailure(
      reportResult,
      deliveryId,
      "Cloudflare Workflow delivery is not configured",
    );
    return;
  }

  // Mark the row before starting the instance. A Workflow can run and report
  // its final result almost immediately, and a later update would then
  // overwrite `success`/`failed` with `delivering`.
  await markDeliveryDelivering(deliveryId, ctx);

  try {
    await createWorkflowInstance(deliveryId, config, options.fetchImpl);
  } catch (error) {
    const message = formatDeliveryError(error);

    console.error(
      `Failed to create Cloudflare webhook workflow for ${deliveryId}: ${message}`,
    );
    await reportFailure(reportResult, deliveryId, message);
    return;
  }

  try {
    await ctx.db
      .update(webhookDelivery)
      .set({ workflowInstanceId: deliveryId, updatedAt: new Date() })
      .where(eq(webhookDelivery.id, deliveryId));
  } catch (error) {
    // The Workflow is already running; it will record the final result. A
    // status-update failure must not turn a successful dispatch into a failure.
    console.error(
      `Failed to store the workflow instance id for ${deliveryId}`,
      error,
    );
  }
}

async function markDeliveryDelivering(
  deliveryId: string,
  ctx: ActionContext,
): Promise<void> {
  try {
    await ctx.db
      .update(webhookDelivery)
      .set({ status: "delivering", updatedAt: new Date() })
      .where(eq(webhookDelivery.id, deliveryId));
  } catch (error) {
    // The Workflow itself is the source of truth for the final result; this
    // status is only the intermediate log state.
    console.error(
      `Failed to mark webhook delivery ${deliveryId} as delivering`,
      error,
    );
  }
}

async function createWorkflowInstance(
  deliveryId: string,
  config: CloudflareWorkflowConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const endpoint = `${CLOUDFLARE_API_BASE_URL}/accounts/${encodeURIComponent(
    config.accountId,
  )}/workflows/${encodeURIComponent(config.workflowName)}/instances`;

  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.apiToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      // Cloudflare deduplicates retried instance creation on this id.
      instance_id: deliveryId,
      // The REST API expects `params` to be a JSON-encoded string.
      params: JSON.stringify({ deliveryId }),
    }),
    signal: AbortSignal.timeout(CLOUDFLARE_API_TIMEOUT_MS),
  });

  const body = await readJson(response);

  if (response.ok && body?.success !== false) {
    return;
  }

  // A retried dispatch may race with the first successful create. That is the
  // desired idempotent outcome, not an error.
  if (body?.errors?.some(isAlreadyExistsError)) {
    return;
  }

  const detail = body?.errors
    ?.map((error) => [error.code, error.message].filter(Boolean).join(" "))
    .filter(Boolean)
    .join("; ");

  throw new Error(
    `Cloudflare Workflow instance creation failed: ${
      detail || `HTTP ${response.status}`
    }`,
  );
}

async function readJson(
  response: Response,
): Promise<CloudflareApiResponse<unknown> | null> {
  try {
    return (await response.json()) as CloudflareApiResponse<unknown>;
  } catch {
    return null;
  }
}

function isAlreadyExistsError(error: CloudflareApiError): boolean {
  return (
    error.code === INSTANCE_ALREADY_EXISTS_CODE ||
    /already exists/i.test(error.message ?? "")
  );
}

async function reportFailure(
  reportResult: (input: WebhookDeliveryResult) => Promise<void>,
  deliveryId: string,
  error: string,
) {
  try {
    await reportResult({
      deliveryId,
      success: false,
      statusCode: null,
      latencyMs: null,
      error,
      attempts: 0,
    });
  } catch (reportError) {
    console.error(
      `Failed to record webhook delivery ${deliveryId} dispatch failure`,
      reportError,
    );
  }
}

function formatDeliveryError(error: unknown): string {
  const message =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);

  return (
    message.replace(/\s+/g, " ").trim().slice(0, MAX_STORED_ERROR_LENGTH) ||
    "Failed to create Cloudflare Workflow instance"
  );
}
