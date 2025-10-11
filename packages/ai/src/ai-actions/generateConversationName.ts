import type { LLMAnalyticsMetadata } from "@convoform/analytics";
import type { FormFieldResponses, Transcript } from "@convoform/db/src/schema";
import { getLogger } from "@convoform/logger";
import { type LanguageModel, generateObject } from "ai";
import { z } from "zod/v4";
import { getModelConfig } from "../config";
import {
  buildCollectedFieldsContextPrompt,
  buildConversationContextPrompt,
} from "../prompts/promptHelpers";

export interface GenerateConversationNameParams {
  formOverview: string;
  transcript: Transcript[];
  formFieldResponses: FormFieldResponses[];
  metadata?: LLMAnalyticsMetadata;
  model?: LanguageModel;
}

export const generateConversationNameOutputSchema = z.object({
  name: z
    .string()
    .describe("A concise, descriptive name for this conversation"),
  reasoning: z
    .string()
    .describe("Brief explanation of why this name was chosen"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score for the name"),
  keywords: z
    .array(z.string())
    .describe("Key terms extracted from the conversation"),
});

export type GenerateConversationNameOutput = z.infer<
  typeof generateConversationNameOutputSchema
>;

/**
 * Generates a descriptive name for the conversation based on context
 * Uses AI SDK V5 for edge runtime compatibility
 */
export async function generateConversationName(
  params: GenerateConversationNameParams,
) {
  const context = {
    ...(params.metadata || {}),
    actionType: "generateConversationName",
  } as const;
  const logger = getLogger().withContext(context);
  const timer = logger.startTimer("ai.generateConversationName");

  try {
    const result = await generateObject({
      model: params.model || getModelConfig(context),
      temperature: 0.7,
      system: getGenerateConversationNameSystemPrompt(params),
      prompt:
        "Generate a descriptive name for this conversation based on the provided context.",
      schema: generateConversationNameOutputSchema,
    });

    timer.end({
      success: true,
      name: result.object.name,
      confidence: result.object.confidence,
      keywordsCount: result.object.keywords.length,
    });

    return result;
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

export function getGenerateConversationNameSystemPrompt(
  params: GenerateConversationNameParams,
): string {
  const conversationContext = buildConversationContextPrompt(params.transcript);
  const collectedFieldsContext = buildCollectedFieldsContextPrompt(
    params.formFieldResponses,
  );

  return `You are an expert at creating concise, descriptive names for conversations based on their content and context. Your names should be informative, professional, and help users quickly identify conversations.

Form Overview: ${params.formOverview}

${collectedFieldsContext ? `Completed data:\n${collectedFieldsContext}` : "No data was collected."}

${conversationContext ? `Conversation summary:\n${conversationContext}` : "No conversation history."}

Instructions:
1. Create a concise name (1-2 words) that captures the essence
2. Include key identifiers like names, key topics, or form type
3. Make it professional and informative
4. Avoid generic terms like "conversation" or "form"
5. Use natural language, not technical jargon
6. Consider the form type and collected data
7. Should be in slug format

Respond with a JSON object containing:
- "name": the generated conversation name
- "reasoning": brief explanation of name choice
- "confidence": confidence score (0-1)
- "keywords": key terms extracted from context

Important: Always respond with valid JSON format.`;
}
