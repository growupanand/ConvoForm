import { createEnv } from "@t3-oss/env-core";
import { databaseEnvSchema } from "./envSchema";

export { databaseEnvSchema };

export const env = createEnv({
  server: databaseEnvSchema,
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
