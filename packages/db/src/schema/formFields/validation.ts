import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { formField, inputTypeEnum } from "./formField";

export const insertFormFieldSchema = createInsertSchema(formField, {
  fieldName: z.string().min(1),
  fieldDescription: z.string().min(1),
  inputType: z.enum(inputTypeEnum.enumValues),
});
export const selectFormFieldSchema = createSelectSchema(formField);
export const patchFormFieldSchema = insertFormFieldSchema.partial().extend({
  id: z.string().min(1),
});

export type FormField = z.infer<typeof selectFormFieldSchema>;
