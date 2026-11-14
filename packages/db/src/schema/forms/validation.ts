import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { insertFormFieldSchema } from "../formFields";
import {
  ANSWER_CHECK_PROVIDERS,
  DEFAULT_ANSWER_CHECK_PROVIDER,
  form,
} from "./form";
import {
  DEFAULT_FORM_LABEL_SETTINGS,
  formLabelSettingsSchema,
} from "./labelSettings";

export const insertFormSchema = createInsertSchema(form, {
  welcomeScreenTitle: z.string().min(1),
  welcomeScreenCTALabel: z.string().min(1),
  welcomeScreenMessage: z.string().min(1),
  name: z.string().min(1),
  overview: z.string().min(1),
  formFieldsOrders: z.string().array(),
  endScreenCTAUrl: z.string().url().nullable().optional(),
  createdAt: z.coerce.date().nullable().optional(),
  updatedAt: z.coerce.date().nullable().optional(),
  labelSettings: formLabelSettingsSchema.default(DEFAULT_FORM_LABEL_SETTINGS),
});
export const selectFormSchema = createSelectSchema(form, {
  formFieldsOrders: z.string().array(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  publishedAt: z.coerce.date().nullable(),
}).extend({
  // Old clients may not send this field yet; default to the DB default.
  answerCheckProvider: z
    .enum(ANSWER_CHECK_PROVIDERS)
    .default(DEFAULT_ANSWER_CHECK_PROVIDER),
  labelSettings: formLabelSettingsSchema.default(DEFAULT_FORM_LABEL_SETTINGS),
});

export const newFormSchema = insertFormSchema
  .omit({ userId: true, organizationId: true })
  .extend({
    formFields: insertFormFieldSchema.omit({ formId: true }).array().min(1),
    labelSettings: formLabelSettingsSchema.optional(),
  });

export const updateFormSchema = newFormSchema.extend({
  id: z.string().min(1),
  formFieldsOrders: z.string().array().min(1),
});

export const patchFormSchema = newFormSchema
  .partial()
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.string().min(1),
  });

export const aiGeneratedFormSchema = newFormSchema;
export const formSubmissionSchema = updateFormSchema;
export const generateFormSchema = z.object({
  formOverview: z.string().min(100).max(500),
});

export type Form = z.infer<typeof selectFormSchema>;
export type NewForm = z.infer<typeof newFormSchema>;

export const formWithFormFieldsSchema = selectFormSchema.extend({
  formFields: insertFormFieldSchema.array().min(1),
});

export type FormWithFormFields = z.infer<typeof formWithFormFieldsSchema>;
