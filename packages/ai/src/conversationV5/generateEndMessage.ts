/**
 * Generates end screen messages for conversation completion
 * Edge runtime compatible with streaming support
 */

import { generateObject } from "ai";
import { z } from "zod/v3";
import { getModelConfig } from "./config";
import { modelParams } from "./config";
import type { GenerateEndMessageParams } from "./types";

// Schema for AI-generated end message
const endMessageSchema = z.object({
  title: z.string().describe("The title for the end screen"),
  message: z.string().describe("The main completion message"),
  subtitle: z
    .string()
    .optional()
    .describe("Optional subtitle for additional context"),
  ctaText: z.string().describe("Call-to-action button text"),
  ctaLink: z.string().optional().describe("Optional URL for the CTA button"),
  showConfetti: z.boolean().describe("Whether to show celebration animation"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score for the message"),
});

/**
 * Generates end screen messages for conversation completion
 * Uses AI SDK V5 for edge runtime compatibility
 */
export async function generateEndMessage({
  formOverview,
  collectedData,
  transcript,
}: GenerateEndMessageParams) {
  const conversationContext = buildConversationContext(transcript);
  const collectedFieldsContext = buildCollectedFieldsContext(collectedData);

  const endMessagePrompt = {
    system: `You are an expert at crafting engaging, personalized end messages for form completions. Create messages that celebrate the user's completion while providing clear next steps.

Form Overview: ${formOverview}

${collectedFieldsContext ? `Completed data:\n${collectedFieldsContext}` : "No data was collected."}

${conversationContext ? `Conversation summary:\n${conversationContext}` : "No conversation history."}

Instructions:
1. Create a celebratory, personalized message
2. Acknowledge what was accomplished
3. Provide clear next steps or expectations
4. Include appropriate call-to-action text
5. Match the tone to the form type and context
6. Consider the amount/quality of data collected

Respond with a JSON object containing:
- "title": engaging title for the end screen
- "message": main completion message with personalization
- "subtitle": optional additional context
- "ctaText": call-to-action button text
- "ctaLink": optional URL for CTA
- "showConfetti": boolean for celebration animation
- "confidence": confidence score (0-1)`,

    user: "Generate an end screen message for this completed conversation based on the provided context.",
  };

  try {
    const result = await generateObject({
      model: getModelConfig(),
      system: endMessagePrompt.system,
      prompt: endMessagePrompt.user,
      schema: endMessageSchema,
      temperature: modelParams.generateEndMessage.temperature,
      maxOutputTokens: modelParams.generateEndMessage.maxTokens,
    });

    return {
      title: result.object.title,
      message: result.object.message,
      subtitle: result.object.subtitle,
      ctaText: result.object.ctaText,
      ctaLink: result.object.ctaLink,
      showConfetti: result.object.showConfetti,
      confidence: result.object.confidence,
    };
  } catch (error) {
    console.error("GenerateEndMessage error:", error);
    return {
      title: "Form Completed!",
      message:
        "Thank you for completing the form. Your responses have been recorded.",
      subtitle: "We'll be in touch soon!",
      ctaText: "Return to Home",
      ctaLink: "/",
      showConfetti: true,
      confidence: 0,
    };
  }
}

/**
 * Builds conversation context from transcript
 * Pure function with no side effects
 */
function buildConversationContext(
  transcript: GenerateEndMessageParams["transcript"],
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
  collectedData: GenerateEndMessageParams["collectedData"],
): string {
  if (!collectedData || collectedData.length === 0) {
    return "No data was collected during this conversation.";
  }

  return collectedData
    .map(
      (field, index) =>
        `${index + 1}. ${field.fieldName}: ${field.fieldValue || "[not provided]"}`,
    )
    .join("\n");
}

/**
 * Simulates streaming for end message generation
 * Useful for UI animations and progressive loading
 */
export async function* streamEndMessage({
  formOverview,
  collectedData,
  transcript,
}: GenerateEndMessageParams) {
  const result = await generateEndMessage({
    formOverview,
    collectedData,
    transcript,
  });

  // Simulate streaming by yielding parts progressively
  yield { type: "title", content: result.title };
  await new Promise((resolve) => setTimeout(resolve, 100));

  yield { type: "message", content: result.message };
  await new Promise((resolve) => setTimeout(resolve, 150));

  if (result.subtitle) {
    yield { type: "subtitle", content: result.subtitle };
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  yield { type: "cta", content: result.ctaText };
  await new Promise((resolve) => setTimeout(resolve, 50));

  yield { type: "complete", content: result };
}
