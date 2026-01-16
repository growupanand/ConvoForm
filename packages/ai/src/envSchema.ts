/**
 * Environment schema validator for AI model configuration
 * Uses the provider registry for validation
 */

import { z } from "zod/v4";
import {
  type LLMProviderName,
  LLM_PROVIDERS,
  getDefaultConfig,
  getSupportedProviders,
  isValidModel,
  isValidProvider,
} from "./llm-providers";

// Environment variable schema
const EnvSchema = z.object({
  CONVERSATION_MODEL: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;

      // Parse format: "provider:model-name"
      const colonIndex = val.indexOf(":");
      if (colonIndex === -1) {
        throw new Error(
          `Invalid format: "${val}". Expected "provider:model-name" (e.g., "openai:gpt-4o-mini")`,
        );
      }

      const provider = val.substring(0, colonIndex).toLowerCase();
      const modelName = val.substring(colonIndex + 1);

      // Validate provider
      if (!isValidProvider(provider)) {
        throw new Error(
          `Unsupported provider: "${provider}". Supported: ${getSupportedProviders().join(", ")}`,
        );
      }

      // Validate model
      if (!isValidModel(provider, modelName)) {
        throw new Error(
          `Invalid model for ${provider}: "${modelName}". Valid: ${LLM_PROVIDERS[provider].models.join(", ")}`,
        );
      }

      return { provider, model: modelName };
    }),

  CONVERSATION_TEMPERATURE: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const temp = Number.parseFloat(val);
      if (Number.isNaN(temp) || temp < 0 || temp > 2) {
        throw new Error(
          "CONVERSATION_TEMPERATURE must be a number between 0 and 2",
        );
      }
      return temp;
    }),

  CONVERSATION_MAX_TOKENS: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const tokens = Number.parseInt(val, 10);
      if (Number.isNaN(tokens) || tokens < 1 || tokens > 4000) {
        throw new Error(
          "CONVERSATION_MAX_TOKENS must be a positive integer between 1 and 4000",
        );
      }
      return tokens;
    }),
});

// Type for validated environment
export type ValidatedEnv = z.infer<typeof EnvSchema>;

/**
 * Validate environment variables with proper error messages
 */
export function validateEnv() {
  try {
    return EnvSchema.parse({
      CONVERSATION_MODEL: process.env.CONVERSATION_MODEL,
      CONVERSATION_TEMPERATURE: process.env.CONVERSATION_TEMPERATURE,
      CONVERSATION_MAX_TOKENS: process.env.CONVERSATION_MAX_TOKENS,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join("\n");
      throw new Error(`Environment validation failed:\n${message}`);
    }
    throw error;
  }
}

/**
 * Get validated model configuration
 */
export function getValidatedModelConfig(): {
  provider: LLMProviderName;
  model: string;
} {
  const validatedEnv = validateEnv();

  if (validatedEnv.CONVERSATION_MODEL) {
    return {
      provider: validatedEnv.CONVERSATION_MODEL.provider as LLMProviderName,
      model: validatedEnv.CONVERSATION_MODEL.model,
    };
  }

  return getDefaultConfig();
}
