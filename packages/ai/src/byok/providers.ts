import type { AiProviderId } from "@convoform/db/src/schema";

export type ByokProviderDefinition = {
  id: AiProviderId;
  name: string;
  /** UI copy describing what the provider is used for. */
  description: string;
  requiresBaseUrl: boolean;
  requiresAccountId: boolean;
  baseUrlPlaceholder?: string;
  secretPlaceholder: string;
  /** Model used by the "Test connection" action when none is supplied. */
  defaultTestModel: string;
  /** How a connection test is performed. */
  testMode: "llm" | "cloudflare-clef";
};

export const BYOK_PROVIDERS: Record<AiProviderId, ByokProviderDefinition> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    description: "GPT models for chat, decisions and background work.",
    requiresBaseUrl: false,
    requiresAccountId: false,
    secretPlaceholder: "sk-...",
    defaultTestModel: "gpt-4o-mini",
    testMode: "llm",
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude models for chat, decisions and background work.",
    requiresBaseUrl: false,
    requiresAccountId: false,
    secretPlaceholder: "sk-ant-...",
    defaultTestModel: "claude-3-5-haiku-latest",
    testMode: "llm",
  },
  google: {
    id: "google",
    name: "Google",
    description: "Gemini models for chat, decisions and background work.",
    requiresBaseUrl: false,
    requiresAccountId: false,
    secretPlaceholder: "AIza...",
    defaultTestModel: "gemini-2.0-flash",
    testMode: "llm",
  },
  groq: {
    id: "groq",
    name: "Groq",
    description: "Fast hosted open models for low-latency chat.",
    requiresBaseUrl: false,
    requiresAccountId: false,
    secretPlaceholder: "gsk_...",
    defaultTestModel: "openai/gpt-oss-120b",
    testMode: "llm",
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    description: "One key for many providers and models.",
    requiresBaseUrl: false,
    requiresAccountId: false,
    secretPlaceholder: "sk-or-...",
    defaultTestModel: "openai/gpt-4o-mini",
    testMode: "llm",
  },
  cloudflare: {
    id: "cloudflare",
    name: "Cloudflare Workers AI",
    description: "Cloudflare models, including Clef for answer checks.",
    requiresBaseUrl: false,
    requiresAccountId: true,
    secretPlaceholder: "Workers AI API token",
    defaultTestModel: "@cf/cloudflare/clef-flash",
    testMode: "cloudflare-clef",
  },
  custom: {
    id: "custom",
    name: "Custom (OpenAI-compatible)",
    description: "Any OpenAI-compatible API, such as a self-hosted gateway.",
    requiresBaseUrl: true,
    requiresAccountId: false,
    baseUrlPlaceholder: "https://api.example.com/v1",
    secretPlaceholder: "API key",
    defaultTestModel: "gpt-4o-mini",
    testMode: "llm",
  },
};

export const BYOK_PROVIDER_IDS = Object.keys(BYOK_PROVIDERS) as AiProviderId[];

export function getByokProvider(
  provider: AiProviderId,
): ByokProviderDefinition {
  return BYOK_PROVIDERS[provider];
}

export function listByokProviders(): ByokProviderDefinition[] {
  return BYOK_PROVIDER_IDS.map((id) => BYOK_PROVIDERS[id]);
}
