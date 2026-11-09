import { ACTIVE_CONVERSATION_WINDOW_MS } from "@convoform/common";
import type { Conversation } from "@convoform/db/src/schema";

export { ACTIVE_CONVERSATION_WINDOW_MS };

type ConversationStatusInput = Pick<
  Conversation,
  "finishedAt" | "isInProgress" | "updatedAt" | "channelType"
>;

/**
 * Web conversations have a websocket lifecycle, so isInProgress is
 * authoritative: closing the tab flips them to abandoned immediately. Channel
 * conversations (WhatsApp, Telegram, ...) have no websocket lifecycle, so a
 * recently updated row stays active while the next inbound message is handled.
 */
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

  const hasWebsocketLifecycle =
    !conversation.channelType || conversation.channelType === "web";

  if (hasWebsocketLifecycle) {
    return false;
  }

  const updatedAt = new Date(conversation.updatedAt).getTime();

  return (
    Number.isFinite(updatedAt) &&
    now - updatedAt < ACTIVE_CONVERSATION_WINDOW_MS
  );
}
