import { leadTemperatureEnum } from "@convoform/db/src/schema";
import { getLogger } from "@convoform/logger";
import { DecisionCheckError } from "../decision/errors";
import { withTimeout } from "../decision/timeout";
import {
  createCloudflareClefLabelProvider,
  hasCloudflareClefLabelCredentials,
} from "./cloudflareClef";
import { getLabelConfig } from "./config";
import { buildLabelQuestions, buildLabelState } from "./questions";
import type {
  ConversationLabelInput,
  GeneratedConversationLabels,
  LabelCategory,
  LabelDeps,
  LabelProvider,
  LabelQuestion,
} from "./types";

export * from "./config";
export * from "./cloudflareClef";
export * from "./questions";
export * from "./types";

export type GenerateConversationLabelsParams = ConversationLabelInput & {
  metadata?: {
    formId?: string;
    conversationId?: string;
    organizationId?: string;
  };
};

/**
 * Runs every label in parallel with its own timeout.
 *
 * A failed or slow label only leaves that label missing; the others are still
 * returned. Callers must treat an empty result as "no labels", not an error.
 */
export async function generateConversationLabels(
  params: GenerateConversationLabelsParams,
  deps: LabelDeps = {},
): Promise<GeneratedConversationLabels> {
  const config = getLabelConfig();
  const categories = normalizeCategories(params.categories);
  const questions = buildLabelQuestions(categories);

  if (process.env.E2E_MOCK_LLM === "1") {
    return { generatedAt: new Date() };
  }

  const usingDefaultProvider = deps.provider === undefined;
  if (usingDefaultProvider && !hasCloudflareClefLabelCredentials()) {
    if (!deps.silent) {
      logLabelEvent(params, "labels:skipped", {
        reason: "missing_credentials",
        model: deps.model ?? config.model,
      });
    }
    return { generatedAt: new Date() };
  }

  const provider =
    deps.provider ??
    createCloudflareClefLabelProvider({}, deps.model ?? config.model);
  const timeoutMs = deps.timeoutMs ?? config.timeoutMs;
  const states = {
    respondent: buildLabelState(params, "respondent"),
    conversation: buildLabelState(params, "conversation"),
  };

  const results = await Promise.all(
    questions.map((question) =>
      runLabel({
        question,
        state: states[question.stateScope],
        provider,
        timeoutMs,
        params,
        silent: deps.silent === true,
      }),
    ),
  );

  return toConversationLabels(results, categories);
}

type LabelRun = {
  question: LabelQuestion;
  value: string;
  score: number;
  provider: string;
};

async function runLabel(args: {
  question: LabelQuestion;
  state: string;
  provider: LabelProvider;
  timeoutMs: number;
  params: GenerateConversationLabelsParams;
  silent: boolean;
}): Promise<LabelRun | null> {
  const { question, state, provider, timeoutMs, params, silent } = args;
  const startedAt = Date.now();

  try {
    const result = await withTimeout(
      (signal) => provider.label({ question, state, signal }),
      timeoutMs,
    );

    if (!silent) {
      logLabelEvent(params, "labels:generated", {
        label: question.id,
        provider: provider.provider,
        score: result.score,
        latencyMs: Date.now() - startedAt,
      });
    }

    return {
      question,
      value: result.value,
      score: clampScore(result.score),
      provider: provider.provider,
    };
  } catch (error) {
    if (!silent) {
      logLabelEvent(params, "labels:skipped", {
        label: question.id,
        reason: error instanceof DecisionCheckError ? error.reason : "failed",
        provider: provider.provider,
        latencyMs: Date.now() - startedAt,
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
    }

    return null;
  }
}

function toConversationLabels(
  runs: Array<LabelRun | null>,
  categories: LabelCategory[],
): GeneratedConversationLabels {
  const generatedAt = new Date();
  const labels: GeneratedConversationLabels = { generatedAt };
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );

  for (const run of runs) {
    if (!run) {
      continue;
    }

    const base = {
      value: run.value,
      score: run.score,
      provider: run.provider,
      timestamp: new Date(),
    };

    if (run.question.id === "tone") {
      labels.tone = base;
      continue;
    }

    if (run.question.id === "sentiment") {
      labels.sentiment = base;
      continue;
    }

    if (run.question.id === "temperature") {
      const temperature = leadTemperatureEnum.safeParse(run.value);
      if (temperature.success) {
        labels.temperature = { ...base, value: temperature.data };
      }
      continue;
    }

    const categoryId = run.question.id.slice("category__".length);
    const category = categoryById.get(categoryId);
    if (!category) {
      continue;
    }

    labels.categories = [
      ...(labels.categories ?? []),
      {
        ...base,
        categoryId: category.id,
        categoryName: category.name,
      },
    ];
  }

  return labels;
}

function clampScore(score: number) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(1, Math.max(0, score));
}

function normalizeCategories(categories: LabelCategory[] | undefined) {
  return (categories ?? [])
    .map((category) => ({
      ...category,
      name: category.name.trim(),
      options: category.options
        .map((option) => option.trim())
        .filter((option) => option.length > 0),
    }))
    .filter((category) => category.options.length > 0);
}

function logLabelEvent(
  params: GenerateConversationLabelsParams,
  event: "labels:generated" | "labels:skipped",
  properties: Record<string, unknown>,
) {
  const logger = params.metadata
    ? getLogger().withContext(params.metadata)
    : getLogger();

  logger.info(event, properties);
}
