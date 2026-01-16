/**
 * Centralized configuration for AI models
 * Edge runtime compatible with environment variable support
 */

import { type LLMAnalyticsMetadata, analytics } from "@convoform/analytics";
import type { LanguageModel } from "ai";
import { getValidatedModelConfig } from "./envSchema";
import {
  type LLMProviderName,
  getDefaultConfig,
  getProviderModel,
} from "./llm-providers";

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
    const baseModel = getProviderModel(
      config.provider as LLMProviderName,
      config.model,
    );

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
    const defaultConfig = getDefaultConfig();
    console.error(
      "Error getting model config, using default:",
      `${defaultConfig.provider}:${defaultConfig.model}`,
      "\nError:\n",
      error,
    );
    return getProviderModel(defaultConfig.provider, defaultConfig.model);
  }
}

/**
 * Get model info (provider and model name) for tracing attributes
 */
export function getModelInfo(): { provider: string; model: string } {
  try {
    const config = getValidatedModelConfig();
    return {
      provider: config.provider,
      model: config.model,
    };
  } catch {
    const defaultConfig = getDefaultConfig();
    return {
      provider: defaultConfig.provider,
      model: defaultConfig.model,
    };
  }
}
