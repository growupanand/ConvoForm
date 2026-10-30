import { getModelConfig } from "@convoform/ai";
import type { LLMAnalyticsMetadata } from "@convoform/analytics";
import {
  type FormFieldResponses,
  type Transcript,
  conversationInsightsSchema,
} from "@convoform/db/src/schema";
import { generateObject } from "ai";

/**
 * Analyzes conversation transcript and form data to generate insights.
 * Uses the same model as form submission (`CONVERSATION_MODEL` / `AI_API_KEY`).
 */
export async function generateConversationInsights(
  transcript: Transcript[],
  formFieldResponses: FormFieldResponses[],
  metadata?: LLMAnalyticsMetadata,
  options?: { isPartial?: boolean },
) {
  // Format the conversation data
  const formattedTranscript = transcript
    .map((entry) => `${entry.role}: ${entry.content}`)
    .join("\n");

  // Extract form questions for context
  const formQuestions = formFieldResponses.map((field) => field.fieldName);

  // Use generateObject with our schema for structured output
  const result = await generateObject({
    model: getModelConfig({
      ...metadata,
      actionType: "generateConversationInsights",
    }),
    system:
      "You analyze conversations and provide structured insights about form submissions.",
    prompt: `
Analyze this conversation transcript between a user and an assistant for a form completion:

${formattedTranscript}

The form asked the following questions:
${formQuestions.join("\n")}

${
  options?.isPartial
    ? "This conversation was abandoned before the form was fully completed. Summarize only what was collected and make clear in the TLDR that the submission is incomplete."
    : "The form was completed successfully. Summarize the full conversation including all answers collected."
}

Generate insights about the conversation including a brief summary (TLDR), any external queries outside the form questions, the user's tone, and overall sentiment.
`,
    schema: conversationInsightsSchema,
  });

  return {
    ...result.object,
    generatedAt: new Date(),
  };
}
