import { and, eq, isNull, sql } from "@convoform/db";
import {
  form,
  user,
  webhookDelivery,
  webhookEndpoint,
} from "@convoform/db/src/schema";
import type { WebhookDeliveryResult } from "@convoform/db/src/schema";
import type { ActionContext } from "../../types/actionContextType";

const DISABLE_AFTER_CONSECUTIVE_FAILURES = 10;
const MAX_STORED_ERROR_LENGTH = 500;

export interface RecordedWebhookDeliveryResult {
  deliveryId: string;
  status: "success" | "failed";
  endpointDisabled: boolean;
  ownerEmail?: string;
  formName?: string;
}

/**
 * Persist the final outcome of a delivery.
 *
 * `consecutiveFailures` counts failed deliveries (a delivery that exhausted
 * all of its attempts), not individual HTTP attempts. Test deliveries never
 * affect the endpoint counter.
 */
export async function recordWebhookDeliveryResult(
  input: WebhookDeliveryResult,
  ctx: ActionContext,
): Promise<RecordedWebhookDeliveryResult> {
  const delivery = await ctx.db.query.webhookDelivery.findFirst({
    where: eq(webhookDelivery.id, input.deliveryId),
    with: {
      endpoint: true,
    },
  });

  if (!delivery) {
    throw new Error(`Webhook delivery not found: ${input.deliveryId}`);
  }

  const now = new Date();
  const status = input.success ? "success" : "failed";

  await ctx.db
    .update(webhookDelivery)
    .set({
      status,
      attempts: input.attempts ?? delivery.attempts,
      lastStatusCode: input.statusCode ?? null,
      lastLatencyMs: input.latencyMs ?? null,
      lastError: input.success
        ? null
        : sanitizeDeliveryError(input.error, delivery.endpoint?.url),
      deliveredAt: input.success ? now : null,
      updatedAt: now,
    })
    .where(eq(webhookDelivery.id, delivery.id));

  // The result endpoint may be retried after a response is lost. Only the
  // first failed result may increment the endpoint counter, otherwise a
  // duplicate report could disable an endpoint early.
  if (!input.success && delivery.status === "failed") {
    return {
      deliveryId: delivery.id,
      status,
      endpointDisabled: delivery.endpoint?.disabledAt != null,
    };
  }

  if (delivery.isTest) {
    return {
      deliveryId: delivery.id,
      status,
      endpointDisabled: false,
    };
  }

  if (input.success) {
    await ctx.db
      .update(webhookEndpoint)
      .set({
        consecutiveFailures: 0,
        updatedAt: now,
      })
      .where(eq(webhookEndpoint.id, delivery.endpointId));

    return {
      deliveryId: delivery.id,
      status,
      endpointDisabled: false,
    };
  }

  // Already disabled: another in-flight failure must not increment the count
  // or send a second owner email.
  if (delivery.endpoint?.disabledAt) {
    return {
      deliveryId: delivery.id,
      status,
      endpointDisabled: true,
    };
  }

  const [endpoint] = await ctx.db
    .update(webhookEndpoint)
    .set({
      consecutiveFailures: sql`${webhookEndpoint.consecutiveFailures} + 1`,
      updatedAt: now,
    })
    .where(eq(webhookEndpoint.id, delivery.endpointId))
    .returning();

  if (
    !endpoint ||
    endpoint.consecutiveFailures < DISABLE_AFTER_CONSECUTIVE_FAILURES
  ) {
    return {
      deliveryId: delivery.id,
      status,
      endpointDisabled: false,
    };
  }

  // Only one concurrent failure can win the transition to disabled.
  const [disabledEndpoint] = await ctx.db
    .update(webhookEndpoint)
    .set({
      enabled: false,
      disabledAt: now,
      disabledReason: `Disabled after ${DISABLE_AFTER_CONSECUTIVE_FAILURES} consecutive failed deliveries`,
      updatedAt: now,
    })
    .where(
      and(
        eq(webhookEndpoint.id, delivery.endpointId),
        isNull(webhookEndpoint.disabledAt),
      ),
    )
    .returning();

  if (!disabledEndpoint) {
    return {
      deliveryId: delivery.id,
      status,
      endpointDisabled: true,
    };
  }

  const [owner] = await ctx.db
    .select({
      ownerEmail: user.email,
      formName: form.name,
    })
    .from(form)
    .innerJoin(user, eq(form.userId, user.userId))
    .where(eq(form.id, disabledEndpoint.formId))
    .limit(1);

  return {
    deliveryId: delivery.id,
    status,
    endpointDisabled: true,
    ownerEmail: owner?.ownerEmail,
    formName: owner?.formName,
  };
}

function sanitizeDeliveryError(
  error: string | null | undefined,
  endpointUrl?: string | null,
): string {
  let normalized = (error ?? "Webhook delivery failed")
    .replace(/\s+/g, " ")
    .trim();

  // Endpoint URLs can contain their own secret token; never store them.
  if (endpointUrl) {
    normalized = normalized.split(endpointUrl).join("[redacted]");
  }

  return (
    normalized.slice(0, MAX_STORED_ERROR_LENGTH) || "Webhook delivery failed"
  );
}
