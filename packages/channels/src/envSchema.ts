import { z } from "zod";

export const channelsEnvSchema = {
  ENCRYPTION_KEY: z.string().min(1),
};
