/**
 * LLM Analytics utilities for AI actions
 * Provides wrapper functions and metadata helpers for PostHog LLM analytics
 */

import type { LLMAnalyticsMetadata } from "@convoform/analytics";
import { getTracedModelConfig } from "../config";

/**
 * AI Action types for analytics tracking
 */
export const AI_ACTION_TYPES = {
  EXTRACT_FIELD_ANSWER: "extract_field_answer",
  GENERATE_FIELD_QUESTION: "generate_field_question",
  GENERATE_CONVERSATION_NAME: "generate_conversation_name",
  GENERATE_END_MESSAGE: "generate_end_message",
  GENERATE_FORM_FIELDS: "generate_form_fields",
  GENERATE_FORM_METADATA: "generate_form_metadata",
} as const;

export type AIActionType =
  (typeof AI_ACTION_TYPES)[keyof typeof AI_ACTION_TYPES];

/**
 * Base metadata for conversation-related AI actions
 */
export interface ConversationAIMetadata extends LLMAnalyticsMetadata {
  formId: string;
  conversationId: string;
  organizationId: string;
  userId?: string;
  fieldType?:
    | "text"
    | "multipleChoice"
    | "datePicker"
    | "rating"
    | "fileUpload";
}

/**
 * Base metadata for form generation AI actions
 */
export interface FormGenerationAIMetadata extends LLMAnalyticsMetadata {
  organizationId: string;
  userId?: string;
  templateType?: string;
}

/**
 * Creates a traced model with conversation-specific metadata
 * @param metadata Conversation metadata for analytics
 * @returns Traced language model
 */
export function createConversationTracedModel(
  metadata: ConversationAIMetadata,
) {
  return getTracedModelConfig({
    ...metadata,
    isAnonymous: !metadata.userId,
    traceId: `${metadata.conversationId}-${Date.now()}`,
  });
}

/**
 * Creates a traced model with form generation-specific metadata
 * @param metadata Form generation metadata for analytics
 * @returns Traced language model
 */
export function createFormGenerationTracedModel(
  metadata: FormGenerationAIMetadata,
) {
  return getTracedModelConfig({
    ...metadata,
    isAnonymous: !metadata.userId,
    traceId: `form-gen-${metadata.organizationId}-${Date.now()}`,
  });
}

/**
 * Wrapper function for AI actions with automatic error handling and timing
 * @param actionType The type of AI action being performed
 * @param aiFunction The AI function to execute
 * @returns Promise with the AI function result
 */
export async function withLLMAnalytics<T>(
  actionType: AIActionType,
  aiFunction: () => Promise<T>,
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await aiFunction();

    // Log successful completion (optional)
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ ${actionType} completed in ${Date.now() - startTime}ms`);
    }

    return result;
  } catch (error) {
    // Log error for debugging
    console.error(`❌ ${actionType} failed:`, error);

    // Re-throw the error to maintain original behavior
    throw error;
  }
}

/**
 * Helper to extract field type from field configuration
 * @param fieldConfig Field configuration object
 * @returns Field type string
 */
export function extractFieldType(fieldConfig: any): string | undefined {
  if (!fieldConfig?.fieldConfiguration?.inputType) {
    return undefined;
  }

  return fieldConfig.fieldConfiguration.inputType;
}

/**
 * Helper to generate consistent trace IDs
 * @param prefix Prefix for the trace ID
 * @param identifier Unique identifier (conversationId, formId, etc.)
 * @returns Formatted trace ID
 */
export function generateTraceId(prefix: string, identifier: string): string {
  return `${prefix}-${identifier}-${Date.now()}`;
}
