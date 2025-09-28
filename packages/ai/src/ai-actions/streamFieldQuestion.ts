import type { LLMAnalyticsMetadata } from "@convoform/analytics";
import type { FormFieldResponses, Transcript } from "@convoform/db/src/schema";
import { type StreamTextOnFinishCallback, type ToolSet, streamText } from "ai";
import { getModelConfig } from "../config";
import {
  buildCollectedFieldsContextPrompt,
  buildConversationContextPrompt,
} from "../prompts/promptHelpers";

export interface StreamFieldQuestionParams {
  formOverview: string;
  transcript: Transcript[];
  formFieldResponses: FormFieldResponses[];
  currentField: FormFieldResponses;
  isFirstQuestion?: boolean;
  metadata?: LLMAnalyticsMetadata;
}

/**
 * Uses AI SDK V5 for edge runtime compatibility
 */
export function streamFieldQuestion(
  params: StreamFieldQuestionParams,
  onFinish?: StreamTextOnFinishCallback<ToolSet> | undefined,
) {
  try {
    return streamText({
      model: getModelConfig({
        ...params.metadata,
        actionType: "generateFieldQuestion",
      }),
      temperature: 0.3,
      system: getGenerateFieldQuestionSystemPrompt(params),
      prompt: `Generate a ${params.isFirstQuestion ? "first" : "follow-up"} question for the field "${params.currentField.fieldName}" based on the provided context.`,
      onFinish,
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
  params: StreamFieldQuestionParams,
): string {
  const conversationContext = buildConversationContextPrompt(params.transcript);
  const collectedFieldsContext = buildCollectedFieldsContextPrompt(
    params.formFieldResponses,
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

Respond with only the question text, nothing else. Do not include any explanations, metadata, or additional formatting.`;
}
