import { createEnv } from "@t3-oss/env-core";
import { channelsEnvSchema } from "./envSchema";

export { channelsEnvSchema };

export const env = createEnv({
  server: channelsEnvSchema,
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
