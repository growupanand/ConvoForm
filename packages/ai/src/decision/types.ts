import type {
  AnswerCheckProvider,
  FormFieldResponses,
  Transcript,
} from "@convoform/db/src/schema";

/**
 * Providers that can decide whether a reply is good enough. `none` is handled
 * by the conversation flow (current behaviour) and never reaches an adapter.
 */
export type DecisionProvider = Exclude<AnswerCheckProvider, "none">;

export type FieldType = FormFieldResponses["fieldConfiguration"]["inputType"];

export type AnswerSufficiencyInput = {
  /** The question the respondent is answering */
  fieldQuestion: string;
  fieldType: FieldType;
  /** The latest reply, already trimmed */
  answer: string;
  /** Earlier transcript entries, oldest first */
  recentTurns?: Transcript[];
};

export type DecisionFallbackReason =
  | "timeout"
  | "missing_credentials"
  | "provider_error"
  | "invalid_response";

export type AdapterDecision = {
  /** Raw provider verdict. The caller applies the confidence threshold. */
  sufficient: boolean;
  /** Probability (0-1) that the answer is sufficient. */
  confidence: number;
};

export type DecisionAdapterCheckOptions = {
  signal: AbortSignal;
};

export interface DecisionAdapter {
  readonly provider: DecisionProvider;
  check(
    input: AnswerSufficiencyInput,
    options: DecisionAdapterCheckOptions,
  ): Promise<AdapterDecision>;
}
