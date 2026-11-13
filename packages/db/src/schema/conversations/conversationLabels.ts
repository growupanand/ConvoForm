import { z } from "zod/v4";

export const userToneEnum = z.enum([
  "formal",
  "casual",
  "frustrated",
  "enthusiastic",
  "neutral",
]);

export const userSentimentEnum = z.enum([
  "positive",
  "negative",
  "neutral",
  "mixed",
]);

export const leadTemperatureEnum = z.enum(["Hot", "Warm", "Cold"]);

export type UserTone = z.infer<typeof userToneEnum>;
export type UserSentiment = z.infer<typeof userSentimentEnum>;
export type LeadTemperature = z.infer<typeof leadTemperatureEnum>;

/** Labels below this score are treated as unreliable and hidden. */
export const MIN_VISIBLE_LABEL_SCORE = 0.6;

export const conversationLabelSchema = z.object({
  value: z.string().min(1),
  /** Probability (0-1) that the value is correct. */
  score: z.number().min(0).max(1),
  provider: z.string().min(1),
  model: z.string().optional(),
  timestamp: z.coerce.date(),
  /** Optional short explanation, currently used for lead temperature. */
  reason: z.string().optional(),
});

export type ConversationLabel = z.infer<typeof conversationLabelSchema>;

export const conversationCategoryLabelSchema = conversationLabelSchema.extend({
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
});

export type ConversationCategoryLabel = z.infer<
  typeof conversationCategoryLabelSchema
>;

export const conversationLabelsSchema = z.object({
  tone: conversationLabelSchema.optional(),
  sentiment: conversationLabelSchema.optional(),
  temperature: conversationLabelSchema.optional(),
  categories: z.array(conversationCategoryLabelSchema).optional(),
  generatedAt: z.coerce.date().optional(),
});

export type ConversationLabels = z.infer<typeof conversationLabelsSchema>;

export type VisibleConversationLabels = {
  tone?: ConversationLabel;
  sentiment?: ConversationLabel;
  temperature?: ConversationLabel;
  categories: ConversationCategoryLabel[];
};

type LabelMetadataLike = {
  labels?: ConversationLabels | null;
  insights?: {
    userTone?: string;
    userSentiment?: string;
    generatedAt?: Date | string;
  } | null;
};

function isVisible(label: ConversationLabel | undefined) {
  return label !== undefined && label.score >= MIN_VISIBLE_LABEL_SCORE;
}

function legacyLabel(
  value: string | undefined,
  generatedAt: Date | string | undefined,
): ConversationLabel | undefined {
  if (!value) {
    return undefined;
  }

  return {
    value,
    score: 1,
    provider: "llm",
    timestamp: generatedAt ? new Date(generatedAt) : new Date(0),
  };
}

/**
 * Returns the labels that are safe to show or export.
 *
 * Conversations completed before the labelling step stored tone and sentiment
 * inside `metaData.insights`; those are used as a fallback so old responses
 * keep their chips. Labels below `MIN_VISIBLE_LABEL_SCORE` are dropped.
 */
export function getVisibleConversationLabels(
  metaData: LabelMetadataLike | null | undefined,
): VisibleConversationLabels {
  const labels = metaData?.labels;

  const tone = isVisible(labels?.tone)
    ? labels?.tone
    : legacyLabel(
        metaData?.insights?.userTone,
        metaData?.insights?.generatedAt,
      );
  const sentiment = isVisible(labels?.sentiment)
    ? labels?.sentiment
    : legacyLabel(
        metaData?.insights?.userSentiment,
        metaData?.insights?.generatedAt,
      );
  const temperature = isVisible(labels?.temperature)
    ? labels?.temperature
    : undefined;

  const categories = (labels?.categories ?? []).filter((label) =>
    isVisible(label),
  );

  return {
    ...(tone ? { tone } : {}),
    ...(sentiment ? { sentiment } : {}),
    ...(temperature ? { temperature } : {}),
    categories,
  };
}

export function hasVisibleConversationLabels(
  labels: VisibleConversationLabels,
) {
  return Boolean(
    labels.tone ||
      labels.sentiment ||
      labels.temperature ||
      labels.categories.length,
  );
}
