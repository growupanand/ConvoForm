import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";
import { form } from "../forms/form";

/**
 * A form-scoped outgoing webhook endpoint.
 *
 * The secret is encrypted at rest with `ENCRYPTION_KEY` (same approach as
 * `Integration.encryptedAccessToken`) and is only ever revealed once, when the
 * endpoint is created.
 */
export const webhookEndpoint = pgTable(
  "WebhookEndpoint",
  {
    ...getBaseSchema(),
    formId: text("formId")
      .notNull()
      .references(() => form.id, { onDelete: "cascade" }),
    organizationId: text("organizationId").notNull(),
    url: text("url").notNull(),
    encryptedSecret: text("encryptedSecret").notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    consecutiveFailures: integer("consecutiveFailures").default(0).notNull(),
    disabledAt: timestamp("disabledAt"),
    disabledReason: text("disabledReason"),
  },
  (table) => [
    index("idx_webhook_endpoint_form_id").on(table.formId),
    index("idx_webhook_endpoint_organization_id").on(table.organizationId),
  ],
);

export type WebhookEndpoint = typeof webhookEndpoint.$inferSelect;
export type NewWebhookEndpoint = typeof webhookEndpoint.$inferInsert;
