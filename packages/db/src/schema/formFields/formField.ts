import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { getBaseSchema } from "../base";
import { form } from "../forms/form";

export const formField = pgTable("FormField", {
  ...getBaseSchema(),
  // Human readable name of the field, also will be display in table column
  fieldName: text("fieldName").notNull(),
  // Used while generating question for the field
  fieldDescription: text("fieldDescription").notNull(),
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
