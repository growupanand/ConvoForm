export const PROVIDER_CONFIG = {
  openai: {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o-mini", "gpt-4.1-nano"] as const,
    defaultModel: "gpt-4o-mini",
  },
  groq: {
    id: "groq",
    name: "Groq",
    models: [
      "meta-llama/llama-4-maverick-17b-128e-instruct",
      "meta-llama/llama-4-scout-17b-16e-instruct",
    ] as const,
    defaultModel: "meta-llama/llama-4-scout-17b-16e-instruct",
  },
  ollama: {
    id: "ollama", // Added ID consistency
    name: "Ollama",
    models: ["smollm", "qwen2.5"] as const,
    defaultModel: "qwen2.5:1.5b",
  },
} as const;

export type LLMProviderName = keyof typeof PROVIDER_CONFIG;

export function getSupportedProviders(): LLMProviderName[] {
  return Object.keys(PROVIDER_CONFIG) as LLMProviderName[];
}

export function isValidProvider(provider: string): provider is LLMProviderName {
  return provider in PROVIDER_CONFIG;
}

export function isValidModel(
  provider: LLMProviderName,
  model: string,
): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = PROVIDER_CONFIG[provider] as any;
  if (!config) return false;

  // Allow exact match or prefix match (soft validation)
  return config.models.some((m: string) => m === model || model.startsWith(m));
}

export function getDefaultConfig(): {
  provider: LLMProviderName;
  model: string;
} {
  return {
    provider: "openai",
    model: PROVIDER_CONFIG.openai.defaultModel,
  };
}
