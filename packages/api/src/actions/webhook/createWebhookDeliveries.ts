import { analytics } from "@convoform/analytics";
import { and, eq, isNull } from "@convoform/db";
import {
  type Conversation,
  webhookDelivery,
  webhookEndpoint,
} from "@convoform/db/src/schema";
import type { ActionContext } from "../../types/actionContextType";
import { deliverWebhook } from "./deliverWebhook";

type DeliveryDispatcher = (
  deliveryId: string,
  ctx: ActionContext,
) => Promise<void>;

/**
 * Create one delivery row per enabled endpoint for a newly completed
 * conversation and kick off delivery without blocking the completion path.
 *
 * The partial unique index on (endpointId, conversationId, eventType) makes
 * this idempotent, so a double completion cannot create two rows.
 */
export async function createWebhookDeliveriesForCompletedConversation(
  conversation: Pick<
    Conversation,
    "id" | "formId" | "organizationId" | "channelType" | "metaData"
  >,
  ctx: ActionContext,
  deliver: DeliveryDispatcher = deliverWebhook,
) {
  const endpoints = await ctx.db.query.webhookEndpoint.findMany({
    where: and(
      eq(webhookEndpoint.formId, conversation.formId),
      eq(webhookEndpoint.enabled, true),
      isNull(webhookEndpoint.disabledAt),
    ),
    columns: {
      id: true,
    },
  });

  if (!endpoints.length) {
    return [];
  }

  const deliveries = await ctx.db
    .insert(webhookDelivery)
    .values(
      endpoints.map((endpoint) => ({
        endpointId: endpoint.id,
        conversationId: conversation.id,
        organizationId: conversation.organizationId,
        eventType: "response.completed" as const,
      })),
    )
    // A concurrent/earlier completion may have already created this row.
    .onConflictDoNothing()
    .returning({ id: webhookDelivery.id });

  for (const delivery of deliveries) {
    void deliver(delivery.id, ctx).catch(async (error) => {
      console.error(
        `Failed to dispatch webhook delivery ${delivery.id}`,
        error,
      );
      try {
        await analytics.captureException(
          error instanceof Error ? error : new Error(String(error)),
          delivery.id,
        );
      } catch {
        // Webhook delivery must never fail the completion path.
      }
    });
  }

  return deliveries;
}
