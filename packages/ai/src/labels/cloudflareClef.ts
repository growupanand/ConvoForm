import { z } from "zod/v4";
import {
  DEFAULT_CLOUDFLARE_CLEF_MODEL,
  firstNonEmpty,
} from "../decision/config";
import {
  DecisionProviderError,
  InvalidDecisionResponseError,
  MissingDecisionCredentialsError,
} from "../decision/errors";
import type {
  LabelProvider,
  LabelProviderInput,
  LabelProviderResult,
} from "./types";

const CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4/accounts";

const clefResponseSchema = z.union([
  z.object({
    result: z.object({
      answers: z.record(z.string(), z.unknown()),
    }),
  }),
  z.object({
    answers: z.record(z.string(), z.unknown()),
  }),
]);

const choiceAnswerSchema = z.object({
  type: z.literal("choice"),
  choice: z.string(),
  probabilities: z.record(z.string(), z.number()).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export type CloudflareClefLabelProviderOptions = {
  fetch?: typeof fetch;
  accountId?: string;
  apiToken?: string;
};

export function createCloudflareClefLabelProvider(
  options: CloudflareClefLabelProviderOptions = {},
  model = DEFAULT_CLOUDFLARE_CLEF_MODEL,
): LabelProvider {
  const fetchImpl = options.fetch ?? fetch;

  return {
    provider: "cloudflare-clef",
    async label({ question, state, signal }: LabelProviderInput) {
      const credentials = resolveCloudflareClefLabelCredentials(options);
      if (!credentials) {
        throw new MissingDecisionCredentialsError();
      }

      const response = await fetchImpl(
        `${CLOUDFLARE_API_BASE}/${credentials.accountId}/ai/run/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${credentials.apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: getModelSelector(model),
            state,
            questions: {
              [question.id]: {
                type: "choice",
                instructions: question.instructions,
                criteria: Object.fromEntries(
                  question.criteria.map((criterion) => [
                    criterion.value,
                    criterion.description,
                  ]),
                ),
              },
            },
          }),
          signal,
        },
      );

      if (!response.ok) {
        throw new DecisionProviderError(
          "Cloudflare Workers AI label request failed",
          response.status,
        );
      }

      const parsed = clefResponseSchema.safeParse(await response.json());
      if (!parsed.success) {
        throw new InvalidDecisionResponseError(
          "Clef returned an invalid response shape",
        );
      }

      const answers =
        "result" in parsed.data
          ? parsed.data.result.answers
          : parsed.data.answers;
      const answer = choiceAnswerSchema.safeParse(answers[question.id]);
      if (!answer.success) {
        throw new InvalidDecisionResponseError(
          "Clef returned an invalid choice answer",
        );
      }

      const allowedValues = new Set(
        question.criteria.map((criterion) => criterion.value),
      );
      if (!allowedValues.has(answer.data.choice)) {
        throw new InvalidDecisionResponseError(
          "Clef chose an option outside the allowed criteria",
        );
      }

      const probability = answer.data.probabilities?.[answer.data.choice];
      const score = probability ?? answer.data.confidence ?? 0;

      return {
        value: answer.data.choice,
        score: clampScore(score),
      } satisfies LabelProviderResult;
    },
  };
}

export function resolveCloudflareClefLabelCredentials(
  options: CloudflareClefLabelProviderOptions = {},
) {
  const accountId = firstNonEmpty(
    options.accountId,
    process.env.CLOUDFLARE_AI_ACCOUNT_ID,
    process.env.CF_ACCOUNT_ID,
  );
  const apiToken = firstNonEmpty(
    options.apiToken,
    process.env.CLOUDFLARE_AI_API_TOKEN,
    process.env.CF_API_TOKEN,
  );

  if (!accountId || !apiToken) {
    return null;
  }

  return { accountId, apiToken };
}

export function hasCloudflareClefLabelCredentials() {
  return resolveCloudflareClefLabelCredentials() !== null;
}

function getModelSelector(model: string) {
  return model.split("/").at(-1)?.trim() || model;
}

function clampScore(score: number) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(1, Math.max(0, score));
}
