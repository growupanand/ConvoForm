import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { insertFormFieldSchema } from "../formFields";
import { form } from "./form";

export const insertFormSchema = createInsertSchema(form, {
  welcomeScreenTitle: z.string().min(1),
  welcomeScreenCTALabel: z.string().min(1),
  welcomeScreenMessage: z.string().min(1),
  name: z.string().min(1),
  overview: z.string().min(1),
});
export const selectFormSchema = createSelectSchema(form);

export const newFormSchema = insertFormSchema
  .omit({ userId: true, workspaceId: true, organizationId: true })
  .extend({
    formFields: insertFormFieldSchema.omit({ formId: true }).array().min(1),
  });

export const updateFormSchema = newFormSchema.extend({
  id: z.string().min(1),
});

export const patchFormSchema = newFormSchema.partial().extend({
  id: z.string().min(1),
});

export const aiGeneratedFormSchema = newFormSchema;
export const formSubmissionSchema = updateFormSchema;
export const generateFormSchema = z.object({
  formOverview: z.string().min(100).max(500),
});

export type Form = z.infer<typeof selectFormSchema>;
