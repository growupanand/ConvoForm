import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { getBaseSchema } from "../base";
import { form } from "../forms/form";

export const INPUT_TYPES = ["text"] as const;

export const inputTypeEnum = pgEnum("inputTypeEnum", INPUT_TYPES);

export const formField = pgTable("FormField", {
  ...getBaseSchema(),
  // Human readable name of the field, also will be display in table column
  fieldName: text("fieldName").notNull(),
  // Used while generating question for the field
  fieldDescription: text("fieldDescription").notNull(),
  inputType: inputTypeEnum("inputType").default("text").notNull(),

  formId: text("formId")
    .notNull()
    .references(() => form.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const formFieldRelations = relations(formField, ({ one }) => ({
  workspace: one(form, {
    fields: [formField.formId],
    references: [form.id],
  }),
}));
