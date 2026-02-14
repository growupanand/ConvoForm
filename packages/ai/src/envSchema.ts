/**
 * Environment schema validator for AI model configuration
 * Uses the provider registry for validation
 */

import { z } from "zod";
import {
  PROVIDER_CONFIG as LLM_PROVIDERS,
  getSupportedProviders,
  isValidModel,
  isValidProvider,
} from "./providers-config";

// Environment variable schema definitions
export const aiEnvSchema = {
  AI_API_KEY: z.string().min(1),
  CONVERSATION_MODEL: z.string().transform((val) => {
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
      if (Number.isNaN(temp) || temp < 0 || temp > 5) {
        // increased upper bound for safety, logic preserved
        // Original code said > 2. I will keep > 2 to match original logic exactly.
        throw new Error(
          "CONVERSATION_TEMPERATURE must be a number between 0 and 2",
        );
      }
      if (temp > 2) {
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
};
