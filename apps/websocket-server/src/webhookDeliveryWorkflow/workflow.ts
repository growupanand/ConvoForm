import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import {
  type ParsedWebhookDeliveryFailure,
  type SignedWebhookRequest,
  type WebhookDeliveryAttempt,
  WebhookDeliveryAttemptError,
  type WebhookDeliveryResultPayload,
  loadSignedWebhookRequest,
  parseWebhookDeliveryFailure,
  reportWebhookDeliveryResult,
  sendSignedWebhookRequest,
} from "./helpers";

export interface WebhookDeliveryWorkflowParams {
  deliveryId: string;
}

/** One initial attempt plus seven retries at 1m, 2m, 4m ... ≈ 2h total. */
const DELIVERY_RETRY_LIMIT = 7;
const MAX_DELIVERY_ATTEMPTS = DELIVERY_RETRY_LIMIT + 1;

/**
 * Durable delivery for `response.completed` webhooks.
 *
 * The Worker only talks to the main app's signed internal routes. It never
 * connects to the database and never holds endpoint secrets: the signed
 * request is built (and re-signed on each retry) by the Next.js app.
 */
export class WebhookDeliveryWorkflow extends WorkflowEntrypoint<
  Env,
  WebhookDeliveryWorkflowParams
> {
  async run(
    event: WorkflowEvent<WebhookDeliveryWorkflowParams>,
    step: WorkflowStep,
  ) {
    const deliveryId = event.payload?.deliveryId;
    const baseUrl = this.env.NEXT_PUBLIC_APP_URL;
    const secret = this.env.INTERNAL_EMAIL_API_SECRET;

    if (!deliveryId || !baseUrl || !secret) {
      throw new Error(
        "WebhookDeliveryWorkflow is missing NEXT_PUBLIC_APP_URL, INTERNAL_EMAIL_API_SECRET or the deliveryId payload",
      );
    }

    let initialRequest: SignedWebhookRequest;

    try {
      initialRequest = await step.do(
        "load signed webhook request",
        {
          retries: { limit: 2, delay: "10 seconds", backoff: "exponential" },
          timeout: "45 seconds",
        },
        () => loadSignedWebhookRequest({ baseUrl, deliveryId, secret }),
      );
    } catch (error) {
      // The request could not be built (deleted delivery, disabled endpoint,
      // unsafe URL, ...). Record it so the delivery does not stay pending.
      const failure = parseWebhookDeliveryFailure(error, 0);
      await this.recordResult(step, baseUrl, secret, deliveryId, {
        deliveryId,
        success: false,
        statusCode: failure.statusCode,
        latencyMs: failure.latencyMs,
        error: failure.error,
        attempts: failure.attempts,
      });

      return { status: "load_failed" as const };
    }

    let outcome: WebhookDeliveryAttempt | null = null;
    let failure: ParsedWebhookDeliveryFailure | null = null;

    try {
      outcome = await step.do(
        "deliver signed webhook",
        {
          retries: {
            limit: DELIVERY_RETRY_LIMIT,
            delay: "1 minute",
            backoff: "exponential",
          },
          timeout: "30 seconds",
        },
        async (ctx) => {
          // Retries re-load the request so `webhook-timestamp` stays inside
          // the consumer's tolerance window and DNS is re-checked per send.
          const request =
            ctx.attempt === 1
              ? initialRequest
              : await reloadForAttempt({
                  attempt: ctx.attempt,
                  baseUrl,
                  deliveryId,
                  secret,
                });

          return sendSignedWebhookRequest(request, {
            attempt: ctx.attempt,
          });
        },
      );
    } catch (error) {
      failure = parseWebhookDeliveryFailure(error, MAX_DELIVERY_ATTEMPTS);
    }

    const result: WebhookDeliveryResultPayload = outcome
      ? {
          deliveryId,
          success: true,
          statusCode: outcome.statusCode,
          latencyMs: outcome.latencyMs,
          error: null,
          attempts: outcome.attempt,
        }
      : {
          deliveryId,
          success: false,
          statusCode: failure?.statusCode ?? null,
          latencyMs: failure?.latencyMs ?? null,
          error: failure?.error ?? "Webhook delivery failed",
          attempts: failure?.attempts ?? MAX_DELIVERY_ATTEMPTS,
        };

    await this.recordResult(step, baseUrl, secret, deliveryId, result);

    return {
      status: result.success ? ("success" as const) : ("failed" as const),
      statusCode: result.statusCode,
      attempts: result.attempts,
    };
  }

  private async recordResult(
    step: WorkflowStep,
    baseUrl: string,
    secret: string,
    deliveryId: string,
    result: WebhookDeliveryResultPayload,
  ) {
    await step.do(
      "record webhook delivery result",
      {
        retries: { limit: 5, delay: "10 seconds", backoff: "exponential" },
        timeout: "30 seconds",
      },
      async () => {
        await reportWebhookDeliveryResult({
          baseUrl,
          secret,
          result: { ...result, deliveryId },
        });
        return { recorded: true };
      },
    );
  }
}

async function reloadForAttempt({
  attempt,
  baseUrl,
  deliveryId,
  secret,
}: {
  attempt: number;
  baseUrl: string;
  deliveryId: string;
  secret: string;
}): Promise<SignedWebhookRequest> {
  try {
    return await loadSignedWebhookRequest({ baseUrl, deliveryId, secret });
  } catch (error) {
    throw new WebhookDeliveryAttemptError({
      attempt,
      statusCode: null,
      latencyMs: 0,
      reason: error instanceof Error ? error.message : String(error),
    });
  }
}
