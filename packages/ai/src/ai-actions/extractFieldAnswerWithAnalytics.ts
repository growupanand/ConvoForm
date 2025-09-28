/**
 * Extract Field Answer with LLM Analytics Integration
 * Enhanced version of extractFieldAnswer with PostHog LLM analytics
 */

import type { FormFieldResponses, Transcript } from "@convoform/db/src/schema";
import { generateObject } from "ai";
import { z } from "zod/v4";
import { buildConversationContextPrompt } from "../prompts/promptHelpers";
import {
  AI_ACTION_TYPES,
  type ConversationAIMetadata,
  createConversationTracedModel,
  extractFieldType,
  withLLMAnalytics,
} from "../utils/llmAnalytics";

export type ExtractFieldAnswerWithAnalyticsParams = {
  formOverview: string;
  transcript: Transcript[];
  currentField: FormFieldResponses;
  // Analytics metadata
  formId: string;
  conversationId: string;
  organizationId: string;
  userId?: string;
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
 * Enhanced with LLM analytics tracking
 */
export async function extractFieldAnswerWithAnalytics(
  params: ExtractFieldAnswerWithAnalyticsParams,
) {
  const {
    formOverview,
    transcript,
    currentField,
    formId,
    conversationId,
    organizationId,
    userId,
  } = params;

  // Prepare analytics metadata
  const analyticsMetadata: ConversationAIMetadata = {
    formId,
    conversationId,
    organizationId,
    userId,
    actionType: AI_ACTION_TYPES.EXTRACT_FIELD_ANSWER,
    fieldType: extractFieldType(currentField) as any,
  };

  // Create traced model with analytics
  const tracedModel = createConversationTracedModel(analyticsMetadata);

  return withLLMAnalytics(AI_ACTION_TYPES.EXTRACT_FIELD_ANSWER, async () => {
    return await generateObject({
      model: tracedModel,
      temperature: 0.1,
      system: getExtractFieldAnswerSystemPrompt({
        formOverview,
        transcript,
        currentField,
      }),
      prompt: `Based on the conversation above, extract the value for "${currentField.fieldName}" and return it as a JSON object.`,
      schema: extractFieldAnswerOutputSchema,
    });
  });
}

/**
 * ==================================================================
 * SYSTEM PROMPT GENERATION
 * ==================================================================
 */

function getExtractFieldAnswerSystemPrompt(params: {
  formOverview: string;
  transcript: Transcript[];
  currentField: FormFieldResponses;
}): string {
  const { formOverview, transcript, currentField } = params;

  return `You are a helpful assistant that extracts specific field answers from conversation transcripts.

**Form Context:**
${formOverview}

**Current Field to Extract:**
- Field Name: ${currentField.fieldName}
- Field Description: ${currentField.fieldDescription || "No description provided"}
- Input Type: ${currentField.fieldConfiguration?.inputType || "unknown"}

**Field Configuration:**
${JSON.stringify(currentField.fieldConfiguration, null, 2)}

**Conversation History:**
${buildConversationContextPrompt(transcript)}

**Instructions:**
1. Look through the conversation and identify the user's response for "${currentField.fieldName}"
2. Extract the answer exactly as the user provided it (don't modify or interpret)
3. Validate that the answer matches the field type requirements
4. Provide a confidence score based on how clear and direct the user's response was
5. If the user hasn't provided a clear answer yet, return null for the answer

**Important Guidelines:**
- For multiple choice fields, extract the exact choice text
- For date fields, preserve the user's date format initially
- For rating fields, extract the numeric value
- For text fields, extract the complete response
- If unsure, err on the side of lower confidence scores
- Only mark as valid if the answer clearly meets the field requirements`;
}
