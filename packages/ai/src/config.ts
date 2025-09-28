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
        baseModel = openai("gpt-4o-mini");
    }

    // If metadata provided and analytics enabled, return traced model
    if (metadata) {
      const isAnalyticsEnabled = true; // TODO: Enable analytics based on environment variable
      if (isAnalyticsEnabled) {
        return analytics.createTracedModel(baseModel, metadata) as Exclude<
          LanguageModel,
          string
        >;
      }
    }

    return baseModel;
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
  const isAnalyticsEnabled = true; // TODO: Enable analytics based on environment variable

  if (!isAnalyticsEnabled) {
    return baseModel;
  }

  return analytics.createTracedModel(baseModel, metadata);
}
