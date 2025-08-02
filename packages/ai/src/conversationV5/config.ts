/**
 * Centralized configuration for AI models
 * Edge runtime compatible with environment variable support
 */

import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { getValidatedModelConfig } from "./envSchema";

/**
 * Get model configuration from validated environment variables
 * Edge runtime compatible with proper error handling
 */
export function getModelConfig(): LanguageModel {
  try {
    const config = getValidatedModelConfig();

    switch (config.provider.toLowerCase()) {
      case "openai":
        return openai(config.model);
      default:
        // This should not happen with validation, but fallback just in case
        console.warn(`Unsupported provider: ${config.provider}, using default`);
        return openai("gpt-4o-mini");
    }
  } catch (error) {
    // Log error and use default
    console.error("Model configuration error:", error);
    return openai("gpt-4o-mini");
  }
}

/**
 * Get model configuration with fallback
 */
export const modelConfig = {
  extractAnswer: getModelConfig(),
  generateQuestion: getModelConfig(),
  generateEndMessage: getModelConfig(),
  generateName: getModelConfig(),
};

/**
 * Model parameters configuration
 */
export const modelParams = {
  extractAnswer: {
    temperature: 0.1,
    maxTokens: 500,
  },
  generateQuestion: {
    temperature: 0.7,
    maxTokens: 500,
  },
  generateEndMessage: {
    temperature: 0.8,
    maxTokens: 500,
  },
  generateName: {
    temperature: 0.3,
    maxTokens: 500,
  },
} as const;
