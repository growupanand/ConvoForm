import type {
  FormFieldResponses,
  LeadTemperature,
  Transcript,
  UserSentiment,
  UserTone,
} from "@convoform/db/src/schema";

export type LabelCategory = {
  id: string;
  name: string;
  options: string[];
};

export type LabelCategoryValue = {
  categoryId: string;
  categoryName: string;
  value: string;
};

export type LabelId =
  | "tone"
  | "sentiment"
  | "temperature"
  | `category__${string}`;

export type LabelStateScope = "respondent" | "conversation";

export type LabelQuestion = {
  id: LabelId;
  instructions: string;
  /**
   * Tone and sentiment only read the respondent's messages; lead temperature
   * and categories use the full conversation.
   */
  stateScope: LabelStateScope;
  /** Options the model may choose from, with a short description each. */
  criteria: Array<{ value: string; description: string }>;
};

export type LabelProviderInput = {
  question: LabelQuestion;
  state: string;
  signal: AbortSignal;
};

export type LabelProviderResult = {
  value: string;
  /** Probability (0-1) that the chosen value is correct. */
  score: number;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
};

export interface LabelProvider {
  readonly provider: string;
  label(input: LabelProviderInput): Promise<LabelProviderResult>;
}

export type ConversationLabelInput = {
  transcript: Transcript[];
  formFieldResponses: FormFieldResponses[];
  formName?: string;
  formOverview?: string;
  categories?: LabelCategory[];
};

export type GeneratedConversationLabel = {
  value: string;
  score: number;
  provider: string;
  model?: string;
  timestamp: Date;
};

export type GeneratedConversationCategoryLabel = GeneratedConversationLabel & {
  categoryId: string;
  categoryName: string;
};

export type GeneratedConversationLabels = {
  tone?: GeneratedConversationLabel;
  sentiment?: GeneratedConversationLabel;
  temperature?: GeneratedConversationLabel & {
    value: LeadTemperature;
  };
  categories?: GeneratedConversationCategoryLabel[];
  generatedAt: Date;
};

export type LabelDeps = {
  provider?: LabelProvider;
  model?: string;
  timeoutMs?: number;
  /** Disable per-label logs (used by the offline eval). */
  silent?: boolean;
};

export type { LeadTemperature, UserSentiment, UserTone };
