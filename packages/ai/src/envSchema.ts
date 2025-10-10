/**
 * Environment schema validator for AI model configuration
 * Validates OpenAI model names against official type definitions
 */

import type { openai } from "@ai-sdk/openai";
import { z } from "zod/v4";

type OpenAIModelName = Parameters<typeof openai>[0];

// OpenAI model IDs from @ai-sdk/openai type definitions
const SUPPORTED_OPENAI_CHAT_MODELS = ["gpt-4o-mini", "gpt-4.1-nano"] as const;

// Create zod schema for model validation
const OpenAIChatModelSchema = z.enum(SUPPORTED_OPENAI_CHAT_MODELS);

// Environment variable schema
const EnvSchema = z.object({
  CONVERSATION_MODEL: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;

      // Parse format: "provider:model-name" or just "model-name"
      const parts = val.split(":");
      const provider = parts[0]?.toLowerCase();
      const modelName = parts[1] || parts[0];

      // Validate based on provider
      switch (provider) {
        case "openai":
          // Validate OpenAI model name
          try {
            OpenAIChatModelSchema.parse(modelName);
            return { provider: "openai", model: modelName };
          } catch (_error) {
            throw new Error(
              `Invalid OpenAI model: "${modelName}". Valid models: ${SUPPORTED_OPENAI_CHAT_MODELS.join(", ")}`,
            );
          }

        case "anthropic":
          // Add Anthropic validation when supported
          return { provider: "anthropic", model: modelName };

        default:
          throw new Error(
            `Unsupported provider: "${provider}". Supported providers: openai, anthropic`,
          );
      }
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
  provider: "openai";
  model: OpenAIModelName;
} {
  const validatedEnv = validateEnv();
  console.log("Validated environment variables:", validatedEnv);

  if (
    validatedEnv.CONVERSATION_MODEL &&
    validatedEnv.CONVERSATION_MODEL.provider === "openai"
  ) {
    const modelName = validatedEnv.CONVERSATION_MODEL.model;
    console.log("Validating model name...", modelName);

    if (modelName !== undefined) {
      if (isValidOpenAiModel(modelName)) {
        console.log("Valid model found: ", modelName);
        return { provider: "openai", model: modelName as OpenAIModelName };
      }
    }
  }
  console.log("Valid mode not found, using default model: gpt-4o-mini");
  return { provider: "openai", model: "gpt-4o-mini" };
}

/**
 * Check if a model name is valid for a provider
 */
export function isValidOpenAiModel(model: string): model is OpenAIModelName {
  return SUPPORTED_OPENAI_CHAT_MODELS.some((modelName) =>
    modelName.startsWith(model),
  );
}
