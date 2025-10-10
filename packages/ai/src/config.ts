/**
 * Centralized configuration for AI models
 * Edge runtime compatible with environment variable support
 */

import { openai } from "@ai-sdk/openai";
import { type LLMAnalyticsMetadata, analytics } from "@convoform/analytics";
import type { LanguageModel } from "ai";
import { DEFAULT_OPENAI_MODEL_NAME } from "./constants";
import { getValidatedModelConfig } from "./envSchema";

const DEFAULT_AI_SDK_MODEL = openai(DEFAULT_OPENAI_MODEL_NAME);

/**
 * Get model configuration from validated environment variables
 * Edge runtime compatible with proper error handling
 * @param metadata Optional analytics metadata - if provided, returns traced model when analytics enabled
 */
export function getModelConfig(
  metadata?: LLMAnalyticsMetadata,
): Exclude<LanguageModel, string> {
  try {
    const config = getValidatedModelConfig();

    let baseModel: LanguageModel;
    switch (config.provider.toLowerCase()) {
      case "openai":
        baseModel = openai(config.model);
        break;
      default:
        // This should not happen with validation, but fallback just in case
        console.warn(`Unsupported provider: ${config.provider}, using default`);
        baseModel = DEFAULT_AI_SDK_MODEL;
    }

    // If metadata provided and analytics enabled, return traced model
    if (metadata) {
      return analytics.createTracedModel(baseModel, metadata) as Exclude<
        LanguageModel,
        string
      >;
    }

    return baseModel;
  } catch (error) {
    // Log error and use default
    console.error(
      "Error getting model config, using default:",
      DEFAULT_OPENAI_MODEL_NAME,
      "\nError:\n",
      error,
    );
    return DEFAULT_AI_SDK_MODEL;
  }
}
