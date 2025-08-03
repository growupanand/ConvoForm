import type { CollectedData, Transcript } from "@convoform/db/src/schema";

/**
 * Builds conversation context from transcript
 * Pure function with no side effects
 */
export function buildConversationContext(transcript: Transcript[]) {
  if (transcript.length === 0) {
    return "No conversation history available.";
  }

  const conversationContext = transcript
    .map(
      (message, index) => `${index + 1}. ${message.role}: ${message.content}`,
    )
    .join("\n");

  return `\nConversation summary:\n${conversationContext}\n` as const;
}

/**
 * Builds context from collected fields
 * Pure function with no side effects
 */
export function buildCollectedFieldsContext(collectedData: CollectedData[]) {
  if (collectedData.length === 0) {
    return "No data was collected during this conversation.";
  }

  const fieldsWithContext = collectedData
    .map(
      (field, index) =>
        `${index + 1}. ${field.fieldName}: ${field.fieldValue || "[not provided]"}`,
    )
    .join("\n");

  return `\nCollected data:\n${fieldsWithContext}\n` as const;
}
