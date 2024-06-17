import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { formField } from "./formField";

export const insertFormFieldSchema = createInsertSchema(formField, {
  fieldName: z.string().min(1),
});
export const selectFormFieldSchema = createSelectSchema(formField);
export const patchFormFieldSchema = insertFormFieldSchema.partial();

export type FormField = z.infer<typeof selectFormFieldSchema>;
