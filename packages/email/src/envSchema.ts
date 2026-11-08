import { z } from "zod";

export const emailEnvSchema = {
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.email().min(1),
  RESEND_WEBHOOK_SECRET: z.string().min(1).optional(),
  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().optional(),
};
