import { z } from "zod";

export const formCreateSchema = z.object({
  name: z.string().max(255),
  overview: z.string().max(255),
  welcomeScreenTitle: z.string().max(255),
  welcomeScreenMessage: z.string().max(255),
  welcomeScreenCTALabel: z.string().max(255),
  aboutCompany: z.string().max(255),
  formField: z.array(
    z.object({
      fieldName: z.string().max(255),
    })
  ),
});

export const formUpdateSchema = z.object({
  name: z.string().min(1).max(255),
  overview: z.string().min(1).max(255),
  welcomeScreenTitle: z.string().min(1).max(255),
  welcomeScreenMessage: z.string().min(1).max(255),
  welcomeScreenCTALabel: z.string().min(1).max(255),
  aboutCompany: z.string().min(1).max(255),
  formField: z
    .array(
      z.object({
        fieldName: z.string().min(1).max(255),
      })
    )
    .min(1),
});

export const formPatchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  overview: z.string().min(1).max(255).optional(),
  welcomeScreenTitle: z.string().min(1).max(255).optional(),
  welcomeScreenMessage: z.string().min(1).max(255).optional(),
  welcomeScreenCTALabel: z.string().min(1).max(255).optional(),
  aboutCompany: z.string().min(1).max(255).optional(),
  formField: z

    .array(
      z.object({
        fieldName: z.string().min(1).max(255),
      })
    )
    .optional(),
});
