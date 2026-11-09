import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";
import type { WebhookDeliveryStatus, WebhookEventType } from "./validation";
import { webhookEndpoint } from "./webhookEndpoint";

/**
 * One durable delivery attempt group for one event sent to one endpoint.
 *
 * The payload is intentionally not stored: it is rebuilt from the conversation
 * at send time so we do not keep another copy of respondent PII.
 */
export const webhookDelivery = pgTable(
  "WebhookDelivery",
  {
    ...getBaseSchema(),
    endpointId: text("endpointId")
      .notNull()
      .references(() => webhookEndpoint.id, { onDelete: "cascade" }),
    conversationId: text("conversationId"),
    organizationId: text("organizationId").notNull(),
    eventType: text("eventType")
      .$type<WebhookEventType>()
      .default("response.completed")
      .notNull(),
    isTest: boolean("isTest").default(false).notNull(),
    status: text("status")
      .$type<WebhookDeliveryStatus>()
      .default("pending")
      .notNull(),
    attempts: integer("attempts").default(0).notNull(),
    lastStatusCode: integer("lastStatusCode"),
    lastLatencyMs: integer("lastLatencyMs"),
    lastError: text("lastError"),
    workflowInstanceId: text("workflowInstanceId"),
    deliveredAt: timestamp("deliveredAt"),
  },
  (table) => [
    index("idx_webhook_delivery_endpoint_created_at").on(
      table.endpointId,
      table.createdAt,
    ),
    index("idx_webhook_delivery_conversation_id").on(table.conversationId),
    // A completed conversation can only ever produce one delivery per
    // endpoint/event, even if the completion path runs twice. Test deliveries
    // are excluded because they have no conversation.
    uniqueIndex("uq_webhook_delivery_endpoint_conversation_event")
      .on(table.endpointId, table.conversationId, table.eventType)
      .where(sql`${table.isTest} = false`),
  ],
);

export type WebhookDelivery = typeof webhookDelivery.$inferSelect;
export type NewWebhookDelivery = typeof webhookDelivery.$inferInsert;
