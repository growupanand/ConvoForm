import type { FormFieldResponses, Transcript } from "@convoform/db/src/schema";
import { generateObject } from "ai";
import { z } from "zod/v4";
import { getModelConfig } from "../config";
import { buildConversationContextPrompt } from "../prompts/promptHelpers";

export type ExtractFieldAnswerParams = {
  formOverview: string;
  transcript: Transcript[];
  currentField: FormFieldResponses;
};

export const extractFieldAnswerOutputSchema = z.object({
  answer: z
    .string()
    .nullable()
    .describe("The extracted answer from the user's response"),
  confidence: z.number().min(0).max(1).describe("Confidence score from 0-1"),
  reasoning: z.string().describe("Brief explanation of the extraction"),
  isValid: z
    .boolean()
    .describe("Whether the extracted answer is valid for this field"),
});

export type ExtractFieldAnswerOutput = z.infer<
  typeof extractFieldAnswerOutputSchema
>;

/**
 * Extracts the user's answer for the current field from conversation transcript
 * Uses AI SDK V5 with edge runtime compatibility
 */
export async function extractFieldAnswer(params: ExtractFieldAnswerParams) {
  try {
    return await generateObject({
      model: getModelConfig(),
      temperature: 0.1,
      system: getExtractFieldAnswerSystemPrompt(params),
      prompt: `Based on the conversation above, extract the value for "${params.currentField.fieldName}" and return it as a JSON object.`,
      schema: extractFieldAnswerOutputSchema,
    });
  } catch (error) {
    // Edge-compatible error handling
    console.error("\n[AI Action error]: extractFieldAnswer\n", error);
    throw error;
  }
}

/**
 * ==================================================================
 * ===================== Helper Functions ===========================
 * ==================================================================
 */

export function getExtractFieldAnswerSystemPrompt(
  params: ExtractFieldAnswerParams,
): string {
  // Build context from transcript
  const conversationContext = buildConversationContextPrompt(params.transcript);

  return `You are an expert at extracting specific field values from conversation transcripts. Your task is to analyze the conversation and extract the answer for the specified field.

Form Overview: ${params.formOverview}
Field to extract: ${params.currentField.fieldName}
Field description: ${params.currentField.fieldDescription}

${conversationContext}

You must respond with a valid JSON object containing:
- "answer": the extracted value as a string, or null if not found
- "confidence": a number between 0 and 1 indicating your confidence
- "reasoning": a brief explanation of why you extracted this value
- "isValid": boolean indicating if this is a valid answer for the field

Important: Always respond with valid JSON format.`;
}
