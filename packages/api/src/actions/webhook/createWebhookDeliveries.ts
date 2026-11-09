import { analytics } from "@convoform/analytics";
import { and, eq, isNull } from "@convoform/db";
import {
  type Conversation,
  webhookDelivery,
  webhookEndpoint,
} from "@convoform/db/src/schema";
import { type ILogger, createConversationLogger } from "@convoform/logger";
import type { ActionContext } from "../../types/actionContextType";
import { deliverWebhook } from "./deliverWebhook";

type DeliveryDispatcher = (
  deliveryId: string,
  ctx: ActionContext,
) => Promise<void>;

type ConversationForWebhookFanOut = Pick<
  Conversation,
  "id" | "formId" | "organizationId" | "channelType" | "metaData"
> & {
  isOwnerPreview?: boolean;
};

async function flushLogger(logger: ILogger) {
  try {
    await logger.flush();
  } catch {
    // Logging must never fail the completion path.
  }
}

/**
 * Create one delivery row per enabled endpoint for a newly completed
 * conversation and kick off delivery without blocking the completion path.
 *
 * The partial unique index on (endpointId, conversationId, eventType) makes
 * this idempotent, so a double completion cannot create two rows.
 */
export async function createWebhookDeliveriesForCompletedConversation(
  conversation: ConversationForWebhookFanOut,
  ctx: ActionContext,
  deliver: DeliveryDispatcher = deliverWebhook,
) {
  const logger = createConversationLogger({
    conversationId: conversation.id,
    formId: conversation.formId,
    organizationId: conversation.organizationId,
  });
  const isOwnerPreview =
    conversation.isOwnerPreview ??
    conversation.metaData?.isOwnerPreview === true;

  logger.info("webhook:fanout:start", {
    conversationId: conversation.id,
    formId: conversation.formId,
    isOwnerPreview,
  });

  try {
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

    logger.info("webhook:fanout:endpoints", {
      count: endpoints.length,
      endpointIds: endpoints.map((endpoint) => endpoint.id),
    });

    if (!endpoints.length) {
      await flushLogger(logger);
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

    logger.info("webhook:fanout:created", {
      deliveryIds: deliveries.map((delivery) => delivery.id),
    });

    for (const delivery of deliveries) {
      void deliver(delivery.id, ctx).catch(async (error) => {
        const message = error instanceof Error ? error.message : String(error);

        logger.error("webhook:fanout:failed", {
          deliveryId: delivery.id,
          error: message,
        });

        try {
          await analytics.captureException(
            error instanceof Error ? error : new Error(message),
            delivery.id,
          );
        } catch {
          // Webhook delivery must never fail the completion path.
        } finally {
          await flushLogger(logger);
        }
      });
    }

    await flushLogger(logger);
    return deliveries;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    logger.error("webhook:fanout:failed", {
      error: message,
    });
    await flushLogger(logger);

    throw error;
  }
}
