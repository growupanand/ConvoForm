import type { CollectedData, Transcript } from "@convoform/db/src/schema";
import { generateObject } from "ai";
import { z } from "zod/v3";
import { getModelConfig } from "../config";
import {
  buildCollectedFieldsContext,
  buildConversationContext,
} from "../utils/ai-actions-helpers";

export interface GenerateFieldQuestionParams {
  formOverview: string;
  transcript: Transcript[];
  collectedData: CollectedData[];
  currentField: CollectedData;
  isFirstQuestion?: boolean;
}

export const generateFieldQuestionOutputSchema = z.object({
  question: z.string().describe("The generated question for the current field"),
  isFollowUp: z.boolean().describe("Whether this is a follow-up question"),
  reasoning: z
    .string()
    .describe("Brief explanation of why this question was chosen"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score for the question"),
});

export type GenerateFieldQuestionOutput = z.infer<
  typeof generateFieldQuestionOutputSchema
>;

/**
 * Generates a question for the current field based on context
 * Uses AI SDK V5 for edge runtime compatibility
 */
export async function generateFieldQuestion(
  params: GenerateFieldQuestionParams,
) {
  try {
    return await generateObject({
      model: getModelConfig(),
      temperature: 0.3,
      system: getGenerateFieldQuestionSystemPrompt(params),
      prompt: `Generate a ${params.isFirstQuestion ? "first" : "follow-up"} question for the field "${params.currentField.fieldName}" based on the provided context.`,
      schema: generateFieldQuestionOutputSchema,
    });
  } catch (error) {
    // Edge-compatible error handling
    console.error("\n[AI Action error]: generateFieldQuestion\n", error);
    throw error;
  }
}

/**
 * ==================================================================
 * ===================== Helper Functions ===========================
 * ==================================================================
 */

export function getGenerateFieldQuestionSystemPrompt(
  params: GenerateFieldQuestionParams,
): string {
  const conversationContext = buildConversationContext(params.transcript);
  const collectedFieldsContext = buildCollectedFieldsContext(
    params.collectedData,
  );

  return `You are an expert conversational AI assistant that generates natural, context-aware questions for form fields. Your questions should be clear, concise, and appropriate for the form type and conversation context.

Form Overview: ${params.formOverview}
Current Field: ${params.currentField.fieldName}
Field Description: ${params.currentField.fieldDescription}

${params.isFirstQuestion ? "This is the first question in the conversation." : "This is a follow-up question based on previous responses."}

${collectedFieldsContext}

${conversationContext}

Instructions:
1. Generate a natural, conversational question
2. For first questions: be welcoming and clear
3. For follow-ups: reference previous context when relevant
4. Keep questions concise but complete
5. Adapt tone to match the form type and context

Respond with a JSON object containing:
- "question": the generated question text
- "isFollowUp": boolean indicating if this follows previous context
- "reasoning": brief explanation of question choice
- "confidence": confidence score (0-1)

Important: Always respond with valid JSON format.`;
}
