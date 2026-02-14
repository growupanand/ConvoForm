import { z } from "zod";

export const databaseEnvSchema = {
  DATABASE_URL: z.url(),
};
