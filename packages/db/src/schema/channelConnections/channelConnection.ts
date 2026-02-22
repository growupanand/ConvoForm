import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  unique,
} from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";
import { form } from "../forms/form";

/**
 * Channel connections link forms to external messaging channels
 * (Telegram, WhatsApp, SMS, etc.).
 *
 * Each row represents a single channel connection for a specific form,
 * storing the channel-specific configuration (e.g., bot token).
 *
 * `channelIdentifier` stores a non-sensitive identifier for the channel
 * account (e.g., the Telegram bot ID from the token format `{bot_id}:{hash}`).
 * This enables duplicate detection across forms without exposing secrets.
 */
export const channelConnection = pgTable(
  "ChannelConnection",
  {
    ...getBaseSchema(),
    formId: text("formId")
      .notNull()
      .references(() => form.id, { onDelete: "cascade", onUpdate: "cascade" }),
    channelType: text("channelType").notNull(),
    channelConfig: jsonb("channelConfig")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    enabled: boolean("enabled").default(true).notNull(),
    organizationId: text("organizationId").notNull(),
    /** Non-sensitive channel account identifier (e.g., Telegram bot ID) */
    channelIdentifier: text("channelIdentifier"),
  },
  (table) => [
    index("idx_channel_connection_form_id").on(table.formId),
    index("idx_channel_connection_org_id").on(table.organizationId),
    unique("uq_channel_connection_type_form").on(
      table.channelType,
      table.formId,
    ),
    unique("uq_channel_connection_identifier").on(
      table.channelType,
      table.channelIdentifier,
    ),
  ],
);

export const channelConnectionRelations = relations(
  channelConnection,
  ({ one }) => ({
    form: one(form, {
      fields: [channelConnection.formId],
      references: [form.id],
    }),
  }),
);
