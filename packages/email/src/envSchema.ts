import { z } from "zod";

export const emailEnvSchema = {
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.email().min(1),
  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().optional(),
};
