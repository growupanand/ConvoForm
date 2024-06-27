import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { formField, inputTypeEnum } from "./formField";

export const insertFormFieldSchema = createInsertSchema(formField, {
  fieldName: z.string().min(1),
  fieldDescription: z.string().min(1),
  inputType: z.enum(inputTypeEnum.enumValues),
});
export const selectFormFieldSchema = createSelectSchema(formField);
export const updateFormFieldSchema = insertFormFieldSchema
  .omit({
    formId: true,
  })
  .extend({
    id: z.string().min(1),
  });
export const patchFormFieldSchema = insertFormFieldSchema.partial().extend({
  id: z.string().min(1),
});

export type FormField = z.infer<typeof selectFormFieldSchema>;
