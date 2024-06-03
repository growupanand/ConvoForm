import { z } from "zod";

export const formFieldSchema = z.object({
  fieldName: z.string().min(1).max(255),
  isMarkedForRemoval: z.boolean().default(false),
});

export type FormField = z.infer<typeof formFieldSchema>;

export const createFormSchema = z.object({
  name: z.string().max(255),
  overview: z.string().max(500),
  welcomeScreenTitle: z.string().max(255),
  welcomeScreenMessage: z.string().max(255),
  welcomeScreenCTALabel: z.string().max(255),
  formField: z.array(
    z.object({
      fieldName: z.string().max(255),
    }),
  ),
  isAIGenerated: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export type CreateFormSchema = z.infer<typeof createFormSchema>;

export const formUpdateSchema = z.object({
  name: z.string().min(1).max(255),
  overview: z.string().min(100).max(500),
  welcomeScreenTitle: z.string().min(1).max(255),
  welcomeScreenMessage: z.string().min(1).max(255),
  welcomeScreenCTALabel: z.string().min(1).max(255),
  formFields: z.array(formFieldSchema).min(1),
});

export const formPatchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  overview: z.string().min(100).max(500).optional(),
  welcomeScreenTitle: z.string().min(1).max(255).optional(),
  welcomeScreenMessage: z.string().min(1).max(255).optional(),
  welcomeScreenCTALabel: z.string().min(1).max(255).optional(),
  formField: z.array(formFieldSchema).optional(),
});

export const createGeneratedFormSchema = formUpdateSchema.merge(
  z.object({
    invalidFormOverviewError: z.string().optional(),
  }),
);

export const generateFormSchema = z.object({
  formOverview: z.string().min(100).max(500),
});
