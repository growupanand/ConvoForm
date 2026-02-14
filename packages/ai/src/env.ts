import { createEnv } from "@t3-oss/env-core";
import { aiEnvSchema } from "./envSchema";
import { type LLMProviderName, getDefaultConfig } from "./providers-config";

export { aiEnvSchema };

export const env = createEnv({
  server: aiEnvSchema,
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

/**
 * Get validated model configuration
 */
export function getValidatedModelConfig(): {
  provider: LLMProviderName;
  model: string;
} {
  // Accessing env directly ensures validation happens.
  // env.CONVERSATION_MODEL is already validated and transformed.

  if (env.CONVERSATION_MODEL) {
    return {
      provider: env.CONVERSATION_MODEL.provider as LLMProviderName,
      model: env.CONVERSATION_MODEL.model,
    };
  }

  return getDefaultConfig();
}

/**
 * @deprecated Use `env` exported from this module instead.
 */
export function validateEnv() {
  return env;
}
