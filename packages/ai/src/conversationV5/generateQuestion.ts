/**
 * Generates questions for conversation fields using AI SDK V5
 * Edge runtime compatible with streaming support
 */

import { generateObject } from "ai";
import { z } from "zod/v3";
import { getModelConfig } from "./config";
import { modelParams } from "./config";
import type { GenerateQuestionParams } from "./types";

// Schema for AI-generated question
const questionSchema = z.object({
  question: z.string().describe("The generated question for the current field"),
  isFollowUp: z.boolean().describe("Whether this is a follow-up question"),
  reasoning: z
    .string()
    .describe("Brief explanation of why this question was chosen"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score for the question"),
});

/**
 * Generates a question for the current field based on context
 * Uses AI SDK V5 for edge runtime compatibility
 */
export async function generateFieldQuestion({
  formOverview,
  currentField,
  collectedData,
  transcript,
  isFirstQuestion = false,
}: GenerateQuestionParams) {
  const conversationContext = buildConversationContext(transcript);
  const collectedFieldsContext = buildCollectedFieldsContext(collectedData);

  const questionPrompt = {
    system: `You are an expert conversational AI assistant that generates natural, context-aware questions for form fields. Your questions should be clear, concise, and appropriate for the form type and conversation context.

Form Overview: ${formOverview}
Current Field: ${currentField.fieldName}
Field Description: ${currentField.fieldDescription}

${isFirstQuestion ? "This is the first question in the conversation." : "This is a follow-up question based on previous responses."}

${collectedFieldsContext ? `Previously collected data:\n${collectedFieldsContext}` : "No data has been collected yet."}

${conversationContext ? `Conversation so far:\n${conversationContext}` : "No conversation history."}

Instructions:
1. Generate a natural, conversational question
2. For first questions: be welcoming and clear
3. For follow-ups: reference previous context when relevant
4. Keep questions concise but complete
5. Adapt tone to match the form type and context

Respond with a JSON object containing:
- "question": the generated question text
- "isFollowUp": boolean indicating if this follows previous context
- "reasoning": brief explanation of question choice
- "confidence": confidence score (0-1)`,

    user: `Generate a ${isFirstQuestion ? "first" : "follow-up"} question for the field "${currentField.fieldName}" based on the provided context.`,
  };

  try {
    const result = await generateObject({
      model: getModelConfig(),
      system: questionPrompt.system,
      prompt: questionPrompt.user,
      schema: questionSchema,
      temperature: modelParams.generateQuestion.temperature,
      maxOutputTokens: modelParams.generateQuestion.maxTokens,
    });

    return {
      question: result.object.question,
      isFollowUp: result.object.isFollowUp,
      reasoning: result.object.reasoning,
      confidence: result.object.confidence,
    };
  } catch (error) {
    console.error("GenerateQuestion error:", error);
    return {
      question: `What is your ${currentField.fieldName}?`,
      isFollowUp: !isFirstQuestion,
      reasoning: `Fallback question due to error: ${error instanceof Error ? error.message : "Unknown error"}`,
      confidence: 0,
    };
  }
}

/**
 * Builds conversation context from transcript
 * Pure function with no side effects
 */
function buildConversationContext(
  transcript: GenerateQuestionParams["transcript"],
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
 * Builds context from previously collected fields
 * Pure function with no side effects
 */
function buildCollectedFieldsContext(
  collectedData: GenerateQuestionParams["collectedData"],
): string {
  if (!collectedData || collectedData.length === 0) {
    return "No data has been collected yet.";
  }

  return collectedData
    .map(
      (field, index) =>
        `${index + 1}. ${field.fieldName}: ${field.fieldValue || "[not provided]"}`,
    )
    .join("\n");
}
