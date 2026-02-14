import { emailEnvSchema } from "@convoform/email/src/env";
import { z } from "zod";

export const apiEnvSchema = {
  ...emailEnvSchema,
  INTERNAL_EMAIL_API_SECRET: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .optional()
    .refine(
      (val) => !!val || !!process.env.VERCEL_URL,
      "NEXT_PUBLIC_APP_URL or VERCEL_URL is required",
    ),
  VERCEL_URL: z.string().optional(),
  CLERK_SECRET_KEY: z.string().min(1),
};
