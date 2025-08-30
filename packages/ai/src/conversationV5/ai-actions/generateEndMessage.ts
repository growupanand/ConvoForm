import type { CollectedData, Transcript } from "@convoform/db/src/schema";
import { generateObject } from "ai";
import { z } from "zod/v3";
import { getModelConfig } from "../config";
import {
  buildCollectedFieldsContextPrompt,
  buildConversationContextPrompt,
} from "../prompts/promptHelpers";

export interface GenerateEndMessageParams {
  formOverview: string;
  transcript: Transcript[];
  collectedData: CollectedData[];
}

const generateEndMessageOutputSchema = z.object({
  title: z.string().describe("The title for the end screen"),
  message: z.string().describe("The main completion message"),
  subtitle: z
    .string()
    .optional()
    .describe("Optional subtitle for additional context"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score for the message"),
});

export type GenerateEndMessageOutput = z.infer<
  typeof generateEndMessageOutputSchema
>;

/**
 * Generates end screen messages for conversation completion
 * Uses AI SDK V5 for edge runtime compatibility
 */
export async function generateEndMessage(params: GenerateEndMessageParams) {
  try {
    return await generateObject({
      model: getModelConfig(),
      schema: generateEndMessageOutputSchema,
      temperature: 0.8,
      system: getGenerateEndMessageSystemPrompt(params),
      prompt:
        "Generate an end screen message for this completed conversation based on the provided context.",
    });
  } catch (error) {
    console.error("\n[AI Action error]: generateEndMessage\n", error);
    throw error;
  }
}

/**
 * ==================================================================
 * ===================== Helper Functions ===========================
 * ==================================================================
 */

export function getGenerateEndMessageSystemPrompt(
  params: GenerateEndMessageParams,
): string {
  const conversationContext = buildConversationContextPrompt(params.transcript);
  const collectedFieldsContext = buildCollectedFieldsContextPrompt(
    params.collectedData,
  );

  return `You are an expert at crafting engaging, personalized end messages for form completions. Create messages that celebrate the user's completion while providing clear next steps.

Form Overview: ${params.formOverview}

${collectedFieldsContext}

${conversationContext}

Instructions:
1. Create a celebratory, personalized message
2. Acknowledge what was accomplished
3. Provide clear next steps or expectations
4. Match the tone to the form type and context
5. Consider the amount/quality of data collected

Respond with a JSON object containing:
- "title": engaging title for the end screen
- "message": main completion message with personalization
- "subtitle": optional additional context
- "confidence": confidence score (0-1)`;
}
