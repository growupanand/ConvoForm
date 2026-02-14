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
import { type LLMProviderName, PROVIDER_CONFIG } from "./providers-config";

// LanguageModelV2 is the actual model object (LanguageModel = string | LanguageModelV2)
type LanguageModelInstance = Exclude<LanguageModel, string>;

export { type LLMProviderName } from "./providers-config";

export const LLM_PROVIDERS = {
  openai: {
    ...PROVIDER_CONFIG.openai,
    // Priority: AI_API_KEY > OPENAI_API_KEY > SDK default
    createModel: (model: string): LanguageModelInstance => {
      const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
      return apiKey ? createOpenAI({ apiKey })(model) : createOpenAI()(model);
    },
  },
  groq: {
    ...PROVIDER_CONFIG.groq,
    // Priority: AI_API_KEY > GROQ_API_KEY > SDK default
    createModel: (model: string): LanguageModelInstance => {
      const apiKey = process.env.AI_API_KEY || process.env.GROQ_API_KEY;
      return apiKey ? createGroq({ apiKey })(model) : createGroq()(model);
    },
  },
  ollama: {
    ...PROVIDER_CONFIG.ollama,
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

export {
  getSupportedProviders,
  isValidProvider,
  isValidModel,
  getDefaultConfig,
} from "./providers-config";

/** Get the default model for a provider */
export function getDefaultModel(provider: LLMProviderName): string {
  return PROVIDER_CONFIG[provider].defaultModel;
}

/** Get a model instance for the given provider and model name */
export function getProviderModel(
  provider: LLMProviderName,
  model: string,
): LanguageModelInstance {
  return LLM_PROVIDERS[provider].createModel(model);
}
