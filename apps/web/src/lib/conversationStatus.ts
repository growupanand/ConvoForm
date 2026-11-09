import type { Conversation } from "@convoform/db/src/schema";

/**
 * A conversation without a finishedAt is considered active while it was
 * updated recently. This keeps web conversations that are mid-stream (before
 * conversation:started lands) and channel conversations (which have no
 * websocket lifecycle) out of the abandoned bucket without relying on
 * isInProgress alone.
 */
export const ACTIVE_CONVERSATION_WINDOW_MS = 30 * 60 * 1000;

type ConversationStatusInput = Pick<
  Conversation,
  "finishedAt" | "isInProgress" | "updatedAt"
>;

export function isConversationInProgress(
  conversation: ConversationStatusInput,
  now: number = Date.now(),
) {
  if (conversation.finishedAt) {
    return false;
  }

  if (conversation.isInProgress) {
    return true;
  }

  const updatedAt = new Date(conversation.updatedAt).getTime();

  return (
    Number.isFinite(updatedAt) &&
    now - updatedAt < ACTIVE_CONVERSATION_WINDOW_MS
  );
}
