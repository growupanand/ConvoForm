/**
 * Decision model configuration.
 *
 * Everything has a code default so the feature works with no `DECISION_*`
 * environment variables set.
 */

import { DEFAULT_ANSWER_CHECK_PROVIDER } from "@convoform/db/src/schema";
import {
  type LLMProviderName,
  isValidModel,
  isValidProvider,
} from "../providers-config";

export { DEFAULT_ANSWER_CHECK_PROVIDER };

export const DEFAULT_CLOUDFLARE_CLEF_MODEL = "@cf/cloudflare/clef-flash";
export const DEFAULT_DECISION_LLM_PROVIDER: LLMProviderName = "groq";
export const DEFAULT_DECISION_LLM_MODEL = "openai/gpt-oss-120b";
export const DEFAULT_DECISION_THRESHOLD = 0.7;
export const DEFAULT_DECISION_TIMEOUT_MS = 1500;

export type LlmDecisionModelConfig = {
  provider: LLMProviderName;
  model: string;
};

export type DecisionConfig = {
  /** Confidence required to accept an answer as sufficient */
  threshold: number;
  /** Hard timeout for a single decision call */
  timeoutMs: number;
  cloudflareClef: {
    model: string;
  };
  llm: LlmDecisionModelConfig;
};

/** Returns the first trimmed, non-empty value from the list. */
export function firstNonEmpty(
  ...values: (string | undefined)[]
): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return undefined;
}

export function parseDecisionThreshold(raw: string | undefined): number {
  if (!raw?.trim()) {
    return DEFAULT_DECISION_THRESHOLD;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return DEFAULT_DECISION_THRESHOLD;
  }

  return parsed;
}

export function parseDecisionTimeoutMs(raw: string | undefined): number {
  if (!raw?.trim()) {
    return DEFAULT_DECISION_TIMEOUT_MS;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 10_000) {
    return DEFAULT_DECISION_TIMEOUT_MS;
  }

  return Math.floor(parsed);
}

export function parseDecisionModel(raw: string | undefined): string {
  const model = raw?.trim();
  return model || DEFAULT_CLOUDFLARE_CLEF_MODEL;
}

export function parseDecisionLlmModel(
  raw: string | undefined,
): LlmDecisionModelConfig {
  const fallback: LlmDecisionModelConfig = {
    provider: DEFAULT_DECISION_LLM_PROVIDER,
    model: DEFAULT_DECISION_LLM_MODEL,
  };

  if (!raw?.trim()) {
    return fallback;
  }

  const colonIndex = raw.indexOf(":");
  if (colonIndex <= 0) {
    return fallback;
  }

  const provider = raw.slice(0, colonIndex).trim().toLowerCase();
  const model = raw.slice(colonIndex + 1).trim();

  if (!isValidProvider(provider) || !isValidModel(provider, model)) {
    return fallback;
  }

  return { provider, model };
}

export function getDecisionConfig(): DecisionConfig {
  return {
    threshold: parseDecisionThreshold(process.env.DECISION_THRESHOLD),
    timeoutMs: parseDecisionTimeoutMs(process.env.DECISION_TIMEOUT_MS),
    cloudflareClef: {
      model: parseDecisionModel(process.env.DECISION_MODEL),
    },
    llm: parseDecisionLlmModel(process.env.DECISION_LLM_MODEL),
  };
}
