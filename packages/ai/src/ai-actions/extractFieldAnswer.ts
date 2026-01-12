import type { LLMAnalyticsMetadata } from "@convoform/analytics";
import type { FormFieldResponses, Transcript } from "@convoform/db/src/schema";
import { getLogger } from "@convoform/logger";
import type { EdgeTracer } from "@convoform/tracing";
import { type LanguageModel, generateObject } from "ai";
import { z } from "zod/v4";
import { getModelConfig, getModelInfo } from "../config";
import { buildConversationContextPrompt } from "../prompts/promptHelpers";

export type ExtractFieldAnswerParams = {
  formOverview: string;
  transcript: Transcript[];
  currentField: FormFieldResponses;
  metadata?: LLMAnalyticsMetadata;
  model?: LanguageModel;
  tracer?: EdgeTracer;
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
  const { tracer } = params;
  const modelInfo = getModelInfo();

  const spanAttributes = {
    field_id: params.currentField.id,
    field_name: params.currentField.fieldName,
    field_type: params.currentField.fieldConfiguration.inputType,
    ai_provider: modelInfo.provider,
    ai_model: modelInfo.model,
  };

  // Context for non-traced logger (error cases only)
  const context = {
    ...(params.metadata || {}),
    fieldId: params.currentField.id,
    fieldName: params.currentField.fieldName,
    fieldType: params.currentField.fieldConfiguration.inputType,
    actionType: "extractFieldAnswer",
  } as const;

  const logger = getLogger().withContext(context);
  const extractFieldAnswerSpan = tracer?.startSpan(
    "extract_field_answer",
    spanAttributes,
  );

  try {
    const result = await generateObject({
      model: params.model || getModelConfig(context),
      temperature: 0.1,
      system: getExtractFieldAnswerSystemPrompt(params.formOverview),
      prompt: buildExtractFieldAnswerPrompt(params),
      schema: extractFieldAnswerOutputSchema,
      maxOutputTokens: 1000,
    });

    extractFieldAnswerSpan?.setAttribute("answer", result.object.answer ?? "");
    extractFieldAnswerSpan?.setAttribute("is_valid", result.object.isValid);
    extractFieldAnswerSpan?.setAttribute("reasoning", result.object.reasoning);
    extractFieldAnswerSpan?.setAttribute(
      "confidence",
      result.object.confidence,
    );

    // Token usage
    if (result.usage) {
      extractFieldAnswerSpan?.setAttributes({
        input_tokens: result.usage.inputTokens || 0,
        output_tokens: result.usage.outputTokens || 0,
        total_tokens:
          (result.usage.inputTokens || 0) + (result.usage.outputTokens || 0),
      });
    }

    extractFieldAnswerSpan?.end();

    return result;
  } catch (error) {
    logger.error("extractFieldAnswer failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    extractFieldAnswerSpan?.setStatus(
      "error",
      error instanceof Error ? error.message : String(error),
    );
    extractFieldAnswerSpan?.end();
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
- isValid: Boolean indicating if the answer meets field requirements
    
IMPORTANT: You must return a valid JSON object only.`;
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
