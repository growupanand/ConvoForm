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
  ENCRYPTION_KEY: z.string().min(1),
  CHANNELS_SERVER_URL: z.string().url().optional(),
  // Optional Cloudflare Workflows delivery engine. All three must be set to
  // enable it; otherwise webhook deliveries use the direct adapter.
  CF_ACCOUNT_ID: z.string().optional(),
  CF_API_TOKEN: z.string().optional(),
  CF_WEBHOOK_WORKFLOW_NAME: z.string().optional(),
};
