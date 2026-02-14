import { createEnv } from "@t3-oss/env-core";
import { apiEnvSchema } from "./envSchema";

export { apiEnvSchema };

export const env = createEnv({
  server: apiEnvSchema,
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
