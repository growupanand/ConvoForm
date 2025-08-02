/**
 * Generates conversation names based on form context and collected data
 * Edge runtime compatible with AI SDK V5
 */

import { generateObject } from "ai";
import { z } from "zod/v3";
import { getModelConfig } from "./config";
import { modelParams } from "./config";
import type { GenerateNameParams } from "./types";

// Schema for AI-generated conversation name
const nameSchema = z.object({
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

/**
 * Generates a descriptive name for the conversation based on context
 * Uses AI SDK V5 for edge runtime compatibility
 */
export async function generateConversationName({
  formOverview,
  collectedData,
  transcript,
}: GenerateNameParams) {
  const conversationContext = buildConversationContext(transcript);
  const collectedFieldsContext = buildCollectedFieldsContext(collectedData);

  const namePrompt = {
    system: `You are an expert at creating concise, descriptive names for conversations based on their content and context. Your names should be informative, professional, and help users quickly identify conversations.

Form Overview: ${formOverview}

${collectedFieldsContext ? `Completed data:\n${collectedFieldsContext}` : "No data was collected."}

${conversationContext ? `Conversation summary:\n${conversationContext}` : "No conversation history."}

Instructions:
1. Create a concise name (3-8 words) that captures the essence
2. Include key identifiers like names, key topics, or form type
3. Make it professional and informative
4. Avoid generic terms like "conversation" or "form"
5. Use natural language, not technical jargon
6. Consider the form type and collected data

Respond with a JSON object containing:
- "name": the generated conversation name
- "reasoning": brief explanation of name choice
- "confidence": confidence score (0-1)
- "keywords": key terms extracted from context

Important: Always respond with valid JSON format.
`,

    user: "Generate a descriptive name for this conversation based on the provided context.",
  };

  try {
    const result = await generateObject({
      model: getModelConfig(),
      system: namePrompt.system,
      prompt: namePrompt.user,
      schema: nameSchema,
      temperature: modelParams.generateName.temperature,
      maxOutputTokens: modelParams.generateName.maxTokens,
    });

    return {
      name: result.object.name,
      reasoning: result.object.reasoning,
      confidence: result.object.confidence,
      keywords: result.object.keywords,
    };
  } catch (error) {
    console.error("GenerateName error:", error);
    return {
      name: "Form Submission",
      reasoning: "Fallback name due to error",
      confidence: 0,
      keywords: ["form", "submission"],
    };
  }
}

/**
 * Builds conversation context from transcript
 * Pure function with no side effects
 */
function buildConversationContext(
  transcript: GenerateNameParams["transcript"],
): string {
  if (!transcript || transcript.length === 0) {
    return "No conversation history available.";
  }

  return transcript
    .map(
      (message, index) => `${index + 1}. ${message.role}: ${message.content}`,
    )
    .join("\n");
}

/**
 * Builds context from collected fields
 * Pure function with no side effects
 */
function buildCollectedFieldsContext(
  collectedData: GenerateNameParams["collectedData"],
): string {
  if (!collectedData || collectedData.length === 0) {
    return "No data was collected during this conversation.";
  }

  return collectedData
    .filter((field) => field.fieldValue) // Only include fields with actual values
    .map(
      (field, index) => `${index + 1}. ${field.fieldName}: ${field.fieldValue}`,
    )
    .join("\n");
}

/**
 * Generates multiple name suggestions for A/B testing
 */
export async function generateNameSuggestions({
  formOverview,
  collectedData,
  transcript,
}: GenerateNameParams) {
  const baseResult = await generateConversationName({
    formOverview,
    collectedData,
    transcript,
  });

  // Generate 2-3 variations based on the base result
  const variations = [
    baseResult,
    {
      ...baseResult,
      name: `${baseResult.name} - ${new Date().toLocaleDateString()}`,
      reasoning: "Added date for uniqueness",
    },
  ];

  return variations.slice(0, 3); // Return up to 3 suggestions
}
