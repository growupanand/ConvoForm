import { createEnv } from "@t3-oss/env-core";
import { emailEnvSchema } from "./envSchema";

export { emailEnvSchema };

export const env = createEnv({
  server: emailEnvSchema,
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
