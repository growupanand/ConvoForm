import type { LLMAnalyticsMetadata } from "@convoform/analytics";
import type { FormFieldResponses, Transcript } from "@convoform/db/src/schema";
import { getLogger } from "@convoform/logger";
import {
  type LanguageModel,
  type StreamTextOnFinishCallback,
  type ToolSet,
  streamText,
} from "ai";
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
  model?: LanguageModel;
}

/**
 * Uses AI SDK V5 for edge runtime compatibility
 */
export function streamFieldQuestion(
  params: StreamFieldQuestionParams,
  onFinish?: StreamTextOnFinishCallback<ToolSet> | undefined,
) {
  const context = {
    ...(params.metadata || {}),
    fieldId: params.currentField.id,
    fieldName: params.currentField.fieldName,
    fieldType: params.currentField.fieldConfiguration.inputType,
    isFirstQuestion: params.isFirstQuestion,
    actionType: "generateFieldQuestion",
  } as const;
  const logger = getLogger().withContext(context);

  const timer = logger.startTimer("ai.streamFieldQuestion");
  let ttfbTimer: number | null = null;
  let firstTokenReceived = false;

  try {
    // Track TTFB (Time To First Byte/Token)
    const startTime = Date.now();

    // Wrap onFinish to include comprehensive logging
    const wrappedOnFinish: StreamTextOnFinishCallback<ToolSet> | undefined =
      onFinish
        ? async (event) => {
            const totalDuration = timer.end({
              textLength: event.text.length,
              finishReason: event.finishReason,
              ttfb: ttfbTimer,
              usage: event.usage,
            });

            timer.end({
              success: true,
              textLength: event.text.length,
              finishReason: event.finishReason,
              ttfb: ttfbTimer,
              totalDuration,
              ...(event.usage && { tokenUsage: event.usage }),
            });

            await onFinish(event);
          }
        : undefined;

    const streamResult = streamText({
      model: params.model || getModelConfig(context),
      temperature: 0.3,
      maxOutputTokens: 200,
      system: getGenerateFieldQuestionSystemPrompt(params.formOverview),
      prompt: buildGenerateFieldQuestionPrompt(params),
      onChunk: ({ chunk }) => {
        // Track TTFB on first chunk
        if (!firstTokenReceived && chunk.type === "text-delta") {
          ttfbTimer = Date.now() - startTime;
          firstTokenReceived = true;

          logger.debug("First token received (TTFB)", {
            ttfb: ttfbTimer,
          });
        }
      },
      onFinish: wrappedOnFinish,
    });

    return streamResult;
  } catch (error) {
    timer.end({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
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
export function getGenerateFieldQuestionSystemPrompt(
  formOverview: string,
): string {
  return `You are a conversational AI that generates natural questions for form fields.

### FORM CONTEXT
${formOverview}

### YOUR TASK
Generate a clear, conversational question for the specified field.

### GUIDELINES
- Be natural and conversational, not robotic
- For first questions: be welcoming and set the tone
- For follow-ups: acknowledge previous context when relevant
- Match the tone to the form type (professional, casual, etc.)
- Keep questions concise and focused

### OUTPUT FORMAT
Respond with only the question text. No explanations or additional formatting.`;
}

/**
 * Builds the user prompt with dynamic field and conversation context
 * formOverview moved to system prompt for better per-form caching
 * This prompt changes with each field extraction and conversation turn
 */
export function buildGenerateFieldQuestionPrompt(
  params: StreamFieldQuestionParams,
): string {
  const conversationContext = buildConversationContextPrompt(params.transcript);
  const collectedFieldsContext = buildCollectedFieldsContextPrompt(
    params.formFieldResponses,
  );

  return `### FIELD TO ASK ABOUT
Name: ${params.currentField.fieldName}
Description: ${params.currentField.fieldDescription}
Field Type: ${params.currentField.fieldConfiguration.inputType}

### QUESTION TYPE
${params.isFirstQuestion ? "First question - welcome the user and start the conversation" : "Follow-up question - build on previous responses"}

${collectedFieldsContext}

${conversationContext}

### INSTRUCTIONS
Generate a ${params.isFirstQuestion ? "welcoming first" : "contextual follow-up"} question for "${params.currentField.fieldName}".`;
}
