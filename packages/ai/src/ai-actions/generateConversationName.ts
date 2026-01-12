import type { LLMAnalyticsMetadata } from "@convoform/analytics";
import type { FormFieldResponses, Transcript } from "@convoform/db/src/schema";
import { getLogger } from "@convoform/logger";
import type { EdgeTracer } from "@convoform/tracing";
import { type LanguageModel, generateObject } from "ai";
import { z } from "zod/v4";
import { getModelConfig, getModelInfo } from "../config";
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
  tracer?: EdgeTracer;
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
  const { tracer } = params;
  const modelInfo = getModelInfo();

  const spanAttributes = {
    "ai.provider": modelInfo.provider,
    "ai.model": modelInfo.model,
  };

  const context = {
    ...(params.metadata || {}),
    actionType: "generateConversationName",
  } as const;
  const logger = getLogger().withContext(context);

  const startTime = Date.now();

  try {
    const result = await generateObject({
      model: params.model || getModelConfig(context),
      temperature: 0.7,
      system: getGenerateConversationNameSystemPrompt(params),
      prompt:
        "Generate a descriptive name for this conversation based on the provided context.",
      schema: generateConversationNameOutputSchema,
    });

    const duration = Date.now() - startTime;

    // Record span if tracer available
    if (tracer) {
      await tracer.withSpan(
        "ai.generateConversationName",
        async (span) => {
          span.setAttribute("ai.duration_ms", duration);
          span.setAttribute("ai.generated_name", result.object.name);
          span.setAttribute("ai.confidence", result.object.confidence);
          span.setAttribute("ai.keywords_count", result.object.keywords.length);

          // Token usage
          if (result.usage) {
            span.setAttribute("ai.tokens.input", result.usage.inputTokens || 0);
            span.setAttribute(
              "ai.tokens.output",
              result.usage.outputTokens || 0,
            );
            span.setAttribute(
              "ai.tokens.total",
              (result.usage.inputTokens || 0) +
                (result.usage.outputTokens || 0),
            );
          }
        },
        spanAttributes,
      );
    }

    return result;
  } catch (error) {
    logger.error("generateConversationName failed", {
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
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
