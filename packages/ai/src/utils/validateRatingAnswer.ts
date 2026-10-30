import type { ExtractFieldAnswerOutput } from "../ai-actions/extractFieldAnswer";

const RATING_WORD_TO_NUMBER: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

/**
 * Parses a rating answer string into an integer (1–10), or null if not parseable.
 */
export function parseRatingAnswerValue(answer: string): number | null {
  const trimmed = answer.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  if (/^\d+$/.test(trimmed)) {
    return Number.parseInt(trimmed, 10);
  }

  const wordValue = RATING_WORD_TO_NUMBER[trimmed];
  return wordValue ?? null;
}

/**
 * Ensures extracted rating answers fall within 1..maxRating.
 * Out-of-range or unparseable values are marked invalid; in-range values are normalized to numeric strings.
 */
export function enforceRatingAnswerConstraints(
  output: ExtractFieldAnswerOutput,
  maxRating: number,
): ExtractFieldAnswerOutput {
  if (!output.answer) {
    return output;
  }

  const parsed = parseRatingAnswerValue(output.answer);
  if (parsed === null || parsed < 1 || parsed > maxRating) {
    return { ...output, isValid: false };
  }

  return {
    ...output,
    answer: String(parsed),
  };
}

/**
 * Validates a rating submitted on the saveExactValue path (no LLM extraction).
 */
export function validateSaveExactRatingAnswer(
  answerText: string,
  maxRating: number,
): { isValid: boolean; answer: string } {
  const result = enforceRatingAnswerConstraints(
    {
      answer: answerText,
      confidence: 1,
      reasoning: "saveExactValue",
      isValid: true,
    },
    maxRating,
  );

  if (!result.isValid || !result.answer) {
    return { isValid: false, answer: answerText };
  }

  return { isValid: true, answer: result.answer };
}
