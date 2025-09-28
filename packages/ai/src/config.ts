/**
 * Centralized configuration for AI models
 * Edge runtime compatible with environment variable support
 */

import { openai } from "@ai-sdk/openai";
import { type LLMAnalyticsMetadata, analytics } from "@convoform/analytics";
import type { LanguageModel } from "ai";
import { getValidatedModelConfig } from "./envSchema";

/**
 * Get model configuration from validated environment variables
 * Edge runtime compatible with proper error handling
 */
export function getModelConfig(): Exclude<LanguageModel, string> {
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
 * Get a traced model configuration with LLM analytics
 * @param metadata Optional metadata to enrich analytics events
 * @returns Traced language model that captures analytics events
 */
export function getTracedModelConfig(
  metadata?: LLMAnalyticsMetadata,
): LanguageModel {
  const baseModel = getModelConfig();

  // Check if LLM analytics is enabled via environment variable
  const isAnalyticsEnabled =
    process.env.NEXT_PUBLIC_POSTHOG_LLM_ANALYTICS !== "false";

  if (!isAnalyticsEnabled) {
    return baseModel;
  }

  return analytics.createTracedModel(baseModel, metadata);
}
