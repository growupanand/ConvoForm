import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { form } from "./form";

export const formField = pgTable("FormField", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  fieldName: text("fieldName").notNull(),
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

export const insertFormFieldSchema = createInsertSchema(formField);
export const selectFormFieldSchema = createSelectSchema(formField);

export type FormField = z.infer<typeof selectFormFieldSchema>;
