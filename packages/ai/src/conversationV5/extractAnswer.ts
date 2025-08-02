/**
 * Pure function to extract field answer from conversation transcript
 * Edge runtime compatible with structured data extraction using generateObject
 */

import { generateObject } from "ai";
// https://github.com/vercel/ai/issues/7160#issuecomment-3140507475
import { z } from "zod/v3";
import { getModelConfig } from "./config";
import { modelParams } from "./config";
import type { ExtractAnswerParams, FieldAnswer } from "./types";

const extractionSchema = z.object({
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

/**
 * Extracts the user's answer for the current field from conversation transcript
 * Uses AI SDK V5 with edge runtime compatibility
 */
export async function extractFieldAnswer({
  transcript,
  currentField,
  formOverview,
}: ExtractAnswerParams): Promise<FieldAnswer> {
  // Validate minimum transcript length (need at least 3 messages)
  if (transcript.length < 3) {
    return {
      value: null,
      confidence: 0,
      reasoning: "Insufficient conversation history",
    };
  }

  // Build context from transcript
  const conversationContext = buildConversationContext(transcript);

  // Create extraction prompt
  const extractionPrompt = {
    system: `You are an expert at extracting specific field values from conversation transcripts. Your task is to analyze the conversation and extract the answer for the specified field.

Form Overview: ${formOverview}
Field to extract: ${currentField.fieldName}
Field description: ${currentField.fieldDescription}

Conversation context:
${conversationContext}

You must respond with a valid JSON object containing:
- "answer": the extracted value as a string, or null if not found
- "confidence": a number between 0 and 1 indicating your confidence
- "reasoning": a brief explanation of why you extracted this value
- "isValid": boolean indicating if this is a valid answer for the field

Important: Always respond with valid JSON format.`,

    user: `Based on the conversation above, extract the value for "${currentField.fieldName}" and return it as a JSON object.`,
  };

  try {
    const result = await generateObject({
      model: getModelConfig(),
      system: extractionPrompt.system,
      prompt: extractionPrompt.user,
      schema: extractionSchema,
      temperature: modelParams.extractAnswer.temperature,
      maxOutputTokens: modelParams.extractAnswer.maxTokens,
    });

    return {
      value: result.object.answer,
      confidence: result.object.confidence,
      reasoning: result.object.reasoning,
      skipValidation:
        "shouldSkipValidation" in currentField
          ? (currentField as any).shouldSkipValidation
          : false,
      isValid: result.object.isValid,
    };
  } catch (error) {
    // Edge-compatible error handling
    console.error("ExtractAnswer error:", error);
    return {
      value: null,
      confidence: 0,
      reasoning: `Extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      skipValidation: false,
    };
  }
}

/**
 * Builds conversation context from transcript
 * Pure function with no side effects
 */
function buildConversationContext(
  transcript: ExtractAnswerParams["transcript"],
): string {
  return transcript
    .map(
      (message, index) => `${index + 1}. ${message.role}: ${message.content}`,
    )
    .join("\n");
}

/**
 * Edge runtime compatible validation helper
 */
export function validateAnswer(
  answer: string,
  fieldSchema?: Record<string, unknown>,
): boolean {
  if (!fieldSchema) return true;

  // Basic validation - can be extended with Zod schemas
  const { required, minLength, maxLength } = fieldSchema as any;

  if (required && (!answer || answer.trim() === "")) {
    return false;
  }

  if (minLength && answer.length < minLength) {
    return false;
  }

  if (maxLength && answer.length > maxLength) {
    return false;
  }

  return true;
}
