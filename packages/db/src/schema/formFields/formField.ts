import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, text } from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";
import { form } from "../forms/form";
import type { FieldConfiguration } from "./validation";

export const formField = pgTable(
  "FormField",
  {
    ...getBaseSchema(),
    // Human readable name of the field, also will be display in table column
    fieldName: text("fieldName").notNull(),
    // Used while generating question for the field
    fieldDescription: text("fieldDescription").notNull(),
    // Used to show answer Input
    fieldConfiguration: jsonb("fieldConfiguration")
      .$type<FieldConfiguration>()
      .notNull(),

    formId: text("formId")
      .notNull()
      .references(() => form.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (formField) => [
    index("idx_form_field_form_id").on(formField.formId),
    index("idx_form_field_config").using("gin", formField.fieldConfiguration),
  ],
);

export const formFieldRelations = relations(formField, ({ one }) => ({
  form: one(form, {
    fields: [formField.formId],
    references: [form.id],
  }),
}));
