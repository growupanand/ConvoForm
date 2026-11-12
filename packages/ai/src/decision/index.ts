import type { AnswerCheckProvider } from "@convoform/db/src/schema";
import { getLogger } from "@convoform/logger";
import { createCloudflareClefAdapter } from "./cloudflareClef";
import {
  DEFAULT_ANSWER_CHECK_PROVIDER,
  type DecisionConfig,
  getDecisionConfig,
} from "./config";
import { DecisionCheckError, DecisionProviderError } from "./errors";
import { createLlmDecisionAdapter } from "./llm";
import { withTimeout } from "./timeout";
import type {
  AnswerSufficiencyInput,
  DecisionAdapter,
  DecisionFallbackReason,
  DecisionProvider,
} from "./types";

export * from "./config";
export * from "./cloudflareClef";
export * from "./errors";
export * from "./llm";
export * from "./types";

export type DecisionLogMetadata = {
  formId?: string;
  conversationId?: string;
  organizationId?: string;
};

export type AnswerSufficiencyCheckParams = AnswerSufficiencyInput & {
  /** Form-level provider choice. Defaults to "none" (check disabled). */
  provider?: AnswerCheckProvider;
  fieldId?: string;
  metadata?: DecisionLogMetadata;
};

export type AnswerSufficiencyResult = {
  sufficient: boolean;
  confidence: number;
  provider: AnswerCheckProvider;
  model: string;
  latencyMs: number;
  /**
   * Present when the check could not run. Callers must proceed with the
   * normal extraction flow instead of treating `sufficient` as a decision.
   */
  fallbackReason?: DecisionFallbackReason;
};

export type AnswerSufficiencyCheckDeps = {
  config?: DecisionConfig;
  adapters?: Partial<Record<DecisionProvider, DecisionAdapter>>;
};

/**
 * Decides whether a respondent's reply is good enough for the current field.
 *
 * Never throws and never blocks the conversation: timeouts and provider errors
 * return `sufficient: true` plus a `fallbackReason`, so the caller can continue
 * with the existing extraction flow.
 */
export async function checkAnswerSufficiency(
  params: AnswerSufficiencyCheckParams,
  deps: AnswerSufficiencyCheckDeps = {},
): Promise<AnswerSufficiencyResult> {
  const config = deps.config ?? getDecisionConfig();
  const provider = params.provider ?? DEFAULT_ANSWER_CHECK_PROVIDER;

  if (provider === "none") {
    return {
      sufficient: true,
      confidence: 1,
      provider,
      model: "none",
      latencyMs: 0,
    };
  }

  // E2E runs use a deterministic mock model; don't let a real decision call
  // change the expected conversation flow.
  if (process.env.E2E_MOCK_LLM === "1") {
    return {
      sufficient: true,
      confidence: 1,
      provider,
      model: "e2e-mock",
      latencyMs: 0,
    };
  }

  const adapter = deps.adapters?.[provider] ?? createAdapter(provider, config);
  const model = getDisplayModel(provider, config);
  const startedAt = Date.now();

  try {
    const decision = await withTimeout(
      (signal) =>
        adapter.check(
          {
            fieldQuestion: params.fieldQuestion,
            fieldType: params.fieldType,
            answer: params.answer,
            recentTurns: params.recentTurns,
          },
          { signal },
        ),
      config.timeoutMs,
    );

    const confidence = clampConfidence(decision.confidence);
    const sufficient = decision.sufficient && confidence >= config.threshold;
    const latencyMs = Date.now() - startedAt;

    logSufficiencyDecision({
      params,
      provider,
      model,
      confidence,
      latencyMs,
      decision: sufficient ? "sufficient" : "insufficient",
    });

    return { sufficient, confidence, provider, model, latencyMs };
  } catch (error) {
    const fallbackReason = toFallbackReason(error);
    const latencyMs = Date.now() - startedAt;

    logSufficiencyDecision({
      params,
      provider,
      model,
      confidence: 0,
      latencyMs,
      decision: "fallback",
      fallbackReason,
      errorName: error instanceof Error ? error.name : "UnknownError",
      httpStatus:
        error instanceof DecisionProviderError ? error.httpStatus : undefined,
    });

    return {
      sufficient: true,
      confidence: 0,
      provider,
      model,
      latencyMs,
      fallbackReason,
    };
  }
}

function createAdapter(
  provider: DecisionProvider,
  config: DecisionConfig,
): DecisionAdapter {
  switch (provider) {
    case "cloudflare-clef":
      return createCloudflareClefAdapter({}, config.cloudflareClef.model);
    case "llm":
      return createLlmDecisionAdapter(config.llm);
  }
}

function getDisplayModel(
  provider: DecisionProvider,
  config: DecisionConfig,
): string {
  switch (provider) {
    case "cloudflare-clef":
      return config.cloudflareClef.model;
    case "llm":
      return `${config.llm.provider}:${config.llm.model}`;
  }
}

function clampConfidence(confidence: number): number {
  if (!Number.isFinite(confidence)) return 0;
  return Math.min(1, Math.max(0, confidence));
}

function toFallbackReason(error: unknown): DecisionFallbackReason {
  if (error instanceof DecisionCheckError) {
    return error.reason;
  }
  if (error instanceof Error && error.name === "AbortError") {
    return "timeout";
  }
  return "provider_error";
}

function logSufficiencyDecision(args: {
  params: AnswerSufficiencyCheckParams;
  provider: DecisionProvider;
  model: string;
  confidence: number;
  latencyMs: number;
  decision: "sufficient" | "insufficient" | "fallback";
  fallbackReason?: DecisionFallbackReason;
  errorName?: string;
  httpStatus?: number;
}) {
  const { params } = args;
  const logger = params.metadata
    ? getLogger().withContext(params.metadata)
    : getLogger();

  // Never log the reply itself: it can contain respondent PII.
  logger.info("decision:sufficiency", {
    fieldId: params.fieldId,
    fieldType: params.fieldType,
    provider: args.provider,
    model: args.model,
    confidence: args.confidence,
    latencyMs: args.latencyMs,
    decision: args.decision,
    ...(args.fallbackReason ? { fallbackReason: args.fallbackReason } : {}),
    ...(args.errorName ? { errorName: args.errorName } : {}),
    ...(args.httpStatus !== undefined ? { httpStatus: args.httpStatus } : {}),
  });
}
