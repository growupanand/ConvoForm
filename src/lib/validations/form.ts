import { z } from "zod";

export const formFieldSchema = z.object({
  fieldName: z.string().min(1).max(255),
});

export type FormField = z.infer<typeof formFieldSchema>;

export const formCreateSchema = z.object({
  name: z.string().max(255),
  overview: z.string().max(255),
  welcomeScreenTitle: z.string().max(255),
  welcomeScreenMessage: z.string().max(255),
  welcomeScreenCTALabel: z.string().max(255),
  formField: z.array(
    z.object({
      fieldName: z.string().max(255),
    }),
  ),
});

export type FormCreateSchema = z.infer<typeof formCreateSchema>;

export const formUpdateSchema = z.object({
  name: z.string().min(1).max(255),
  overview: z.string().min(1).max(255),
  welcomeScreenTitle: z.string().min(1).max(255),
  welcomeScreenMessage: z.string().min(1).max(255),
  welcomeScreenCTALabel: z.string().min(1).max(255),
  formField: z.array(formFieldSchema).min(1),
});

export const formPatchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  overview: z.string().min(1).max(255).optional(),
  welcomeScreenTitle: z.string().min(1).max(255).optional(),
  welcomeScreenMessage: z.string().min(1).max(255).optional(),
  welcomeScreenCTALabel: z.string().min(1).max(255).optional(),
  formField: z.array(formFieldSchema).optional(),
});
