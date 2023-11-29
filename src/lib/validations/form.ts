import { z } from "zod";

export const formCreateSchema = z.object({
  overview: z.string().max(255),
  welcomeScreenTitle: z.string().max(255),
  welcomeScreenMessage: z.string().max(255),
  welcomeScreenCTALabel: z.string().max(255),
  aboutCompany: z.string().max(255),
  journey: z.array(
    z.object({
      fieldName: z.string().min(1).max(255),
    })
  ),
});

export const formUpdateSchema = z.object({
  overview: z.string().min(1).max(255),
  welcomeScreenTitle: z.string().min(1).max(255),
  welcomeScreenMessage: z.string().min(1).max(255),
  welcomeScreenCTALabel: z.string().min(1).max(255),
  aboutCompany: z.string().min(1).max(255),
  journey: z
    .array(
      z.object({
        fieldName: z.string().min(1).max(255),
      })
    )
    .min(1),
});
