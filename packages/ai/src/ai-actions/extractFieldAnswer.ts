import type { LLMAnalyticsMetadata } from "@convoform/analytics";
import type { FormFieldResponses, Transcript } from "@convoform/db/src/schema";
import { type LanguageModel, generateObject } from "ai";
import { z } from "zod/v4";
import { getModelConfig } from "../config";
import { buildConversationContextPrompt } from "../prompts/promptHelpers";

export type ExtractFieldAnswerParams = {
  formOverview: string;
  transcript: Transcript[];
  currentField: FormFieldResponses;
  metadata?: LLMAnalyticsMetadata;
  model?: LanguageModel;
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
      model:
        params.model ||
        getModelConfig({
          ...params.metadata,
          actionType: "extractFieldAnswer",
        }),
      temperature: 0.1,
      system: getExtractFieldAnswerSystemPrompt(params.formOverview),
      prompt: buildExtractFieldAnswerPrompt(params),
      schema: extractFieldAnswerOutputSchema,
      maxOutputTokens: 200,
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

/**
 * System prompt with form context for per-form LLM caching optimization
 * Including formOverview here enables better cache hits within a form's conversations
 * while keeping the prompt static for all fields/turns of that specific form
 *
 * Cache scope: Per-form (same system prompt for all conversations of one form)
 * Cache benefit: ~50-90% cost reduction + faster response times after first request
 */
export function getExtractFieldAnswerSystemPrompt(
  formOverview: string,
): string {
  return `You are an expert at extracting field values from conversation transcripts.

### FORM CONTEXT
${formOverview}

### YOUR TASK
Analyze the conversation transcript and extract the user's answer for the specified field.

### EXTRACTION GUIDELINES
- Extract the most relevant answer from the user's messages
- Return null if no clear answer is found
- Consider the field's description and requirements
- Validate the answer matches the expected field type
- Provide confidence based on clarity and relevance of the user's response

### OUTPUT REQUIREMENTS
- answer: The extracted value as a string, or null if not found
- confidence: Score from 0-1 indicating extraction certainty
- reasoning: Brief explanation of your extraction decision
- isValid: Boolean indicating if the answer meets field requirements`;
}

/**
 * Builds the user prompt with dynamic field and conversation context
 * formOverview moved to system prompt for better per-form caching
 * This prompt changes with each field extraction and conversation turn
 */
export function buildExtractFieldAnswerPrompt(
  params: ExtractFieldAnswerParams,
): string {
  const conversationContext = buildConversationContextPrompt(params.transcript);

  return `### FIELD TO EXTRACT
Name: ${params.currentField.fieldName}
Description: ${params.currentField.fieldDescription}
Field Type: ${params.currentField.fieldConfiguration.inputType}

### CONVERSATION TRANSCRIPT
${conversationContext}

### INSTRUCTIONS
Extract the user's answer for the field "${params.currentField.fieldName}" from the conversation above.`;
}
