import { Message } from "ai";

/**
 * Extract last assistant message from messages
 * @param messages
 * @returns
 */
export const getCurrentQuestion = (messages: Message[]): string | undefined => {
  const lastChatMessage = messages[messages.length - 1];
  return lastChatMessage?.role === "assistant"
    ? lastChatMessage.content
    : undefined;
};

/**
 * Check if there is only one assistant message in the messages
 * @param messages
 * @returns
 */
export const isFirstQuestion = (messages: Message[]): boolean => {
  let questionsCount = 0;
  for (const element of messages) {
    const message = element;
    const isQuestion = message?.role === "assistant";
    if (isQuestion) {
      questionsCount++;
    }
    if (questionsCount > 1) {
      return false;
    }
  }
  return true;
};
