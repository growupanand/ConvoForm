import { relations } from "drizzle-orm";
import { boolean, index, json, pgTable, text } from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";
import { form } from "../forms/form";
import { integration } from "./integration";

export const formIntegration = pgTable(
  "FormIntegration",
  {
    ...getBaseSchema(),
    formId: text("formId")
      .notNull()
      .references(() => form.id, { onDelete: "cascade" }),
    integrationId: text("integrationId")
      .notNull()
      .references(() => integration.id, { onDelete: "cascade" }),
    config: json("config").$type<Record<string, any>>().default({}),
    enabled: boolean("enabled").default(true).notNull(),
  },
  (table) => [
    index("idx_form_integration_form_id").on(table.formId),
    index("idx_form_integration_integration_id").on(table.integrationId),
  ],
);

export const formIntegrationRelations = relations(
  formIntegration,
  ({ one }) => ({
    form: one(form, {
      fields: [formIntegration.formId],
      references: [form.id],
    }),
    integration: one(integration, {
      fields: [formIntegration.integrationId],
      references: [integration.id],
    }),
  }),
);
