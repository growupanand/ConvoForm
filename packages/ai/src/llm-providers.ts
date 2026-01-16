/**
 * Provider Registry - Single source of truth for all AI providers
 *
 * To add a new provider:
 * 1. Add the @ai-sdk/[provider] dependency
 * 2. Add entry to PROVIDERS object below
 * That's it!
 */

import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { createOllama } from "ai-sdk-ollama";

// LanguageModelV2 is the actual model object (LanguageModel = string | LanguageModelV2)
type LanguageModelInstance = Exclude<LanguageModel, string>;

// ============================================================================
// Provider Registry
// ============================================================================

export type LLMProviderName = keyof typeof LLM_PROVIDERS;

export const LLM_PROVIDERS = {
  openai: {
    name: "openai" as const,
    models: ["gpt-4o-mini", "gpt-4.1-nano"] as const,
    defaultModel: "gpt-4o-mini",
    // Priority: AI_API_KEY > OPENAI_API_KEY > SDK default
    createModel: (model: string): LanguageModelInstance => {
      const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
      return apiKey ? createOpenAI({ apiKey })(model) : createOpenAI()(model);
    },
  },
  groq: {
    name: "groq" as const,
    models: [
      "meta-llama/llama-4-maverick-17b-128e-instruct",
      "meta-llama/llama-4-scout-17b-16e-instruct",
    ] as const,
    defaultModel: "meta-llama/llama-4-scout-17b-16e-instruct",
    // Priority: AI_API_KEY > GROQ_API_KEY > SDK default
    createModel: (model: string): LanguageModelInstance => {
      const apiKey = process.env.AI_API_KEY || process.env.GROQ_API_KEY;
      return apiKey ? createGroq({ apiKey })(model) : createGroq()(model);
    },
  },
  ollama: {
    name: "ollama" as const,
    models: ["smollm", "qwen2.5"] as const,
    defaultModel: "qwen2.5:1.5b",
    // Ollama runs locally, uses OLLAMA_BASE_URL for custom endpoint (default: http://localhost:11434)
    // Ollama runs locally, uses OLLAMA_BASE_URL for custom endpoint (default: http://localhost:11434)
    createModel: (model: string): LanguageModelInstance => {
      const baseURL = process.env.OLLAMA_BASE_URL;
      const ollamaProvider = createOllama({
        baseURL,
      });

      return ollamaProvider(model);
    },
  },
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/** Get list of supported provider names */
export function getSupportedProviders(): LLMProviderName[] {
  return Object.keys(LLM_PROVIDERS) as LLMProviderName[];
}

/** Check if a provider is valid */
export function isValidProvider(provider: string): provider is LLMProviderName {
  return provider in LLM_PROVIDERS;
}

/** Check if a model is valid for the given provider */
export function isValidModel(
  provider: LLMProviderName,
  model: string,
): boolean {
  const providerConfig = LLM_PROVIDERS[provider];
  return providerConfig.models.some((m) => m === model || model.startsWith(m));
}

/** Get the default model for a provider */
export function getDefaultModel(provider: LLMProviderName): string {
  return LLM_PROVIDERS[provider].defaultModel;
}

/** Get a model instance for the given provider and model name */
export function getProviderModel(
  provider: LLMProviderName,
  model: string,
): LanguageModelInstance {
  return LLM_PROVIDERS[provider].createModel(model);
}

/** Get default provider and model configuration */
export function getDefaultConfig(): {
  provider: LLMProviderName;
  model: string;
} {
  return {
    provider: "openai",
    model: LLM_PROVIDERS.openai.defaultModel,
  };
}
