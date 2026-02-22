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
 * Channel connections represent external messaging channel bots
 * (Telegram, WhatsApp, SMS, etc.) that can be independently managed.
 *
 * A bot can exist without a form (`formId` is nullable) and be
 * assigned/switched between forms at any time.
 *
 * `channelIdentifier` stores a non-sensitive identifier for the channel
 * account (e.g., the Telegram bot ID from the token format `{bot_id}:{hash}`).
 * This is used as the stable webhook routing key.
 */
export const channelConnection = pgTable(
  "ChannelConnection",
  {
    ...getBaseSchema(),
    formId: text("formId").references(() => form.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    channelType: text("channelType").notNull(),
    channelConfig: jsonb("channelConfig")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    enabled: boolean("enabled").default(true).notNull(),
    organizationId: text("organizationId").notNull(),
    /** Non-sensitive channel account identifier (e.g., Telegram bot ID). Used as stable webhook key. */
    channelIdentifier: text("channelIdentifier").notNull(),
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
