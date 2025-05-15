import { openai } from "@ai-sdk/openai";
import {
  type CollectedData,
  type Transcript,
  conversationInsightsSchema,
} from "@convoform/db/src/schema";
// services/insightsService.ts
import { generateObject } from "ai";

/**
 * Analyzes conversation transcript and form data to generate insights
 */
export async function generateConversationInsights(
  transcript: Transcript[],
  collectedData: CollectedData[],
) {
  // Format the conversation data
  const formattedTranscript = transcript
    .map((entry) => `${entry.role}: ${entry.content}`)
    .join("\n");

  // Extract form questions for context
  const formQuestions = collectedData.map((field) => field.fieldName);

  // Use generateObject with our schema for structured output
  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    system:
      "You analyze conversations and provide structured insights about form submissions.",
    prompt: `
Analyze this conversation transcript between a user and an assistant for a form completion:

${formattedTranscript}

The form asked the following questions:
${formQuestions.join("\n")}

Generate insights about the conversation including a brief summary (TLDR), any external queries outside the form questions, the user's tone, and overall sentiment.
`,
    schema: conversationInsightsSchema,
  });

  return {
    ...result.object,
    generatedAt: new Date(),
  };
}
