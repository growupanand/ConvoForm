import type { CoreServiceUIMessage } from "@convoform/ai";
import type { ActionContext } from "@convoform/api/src/types/actionContextType";
import type { CoreConversation } from "@convoform/db/src/schema";
import { createConversationLogger } from "@convoform/logger";
import type { EdgeTracer } from "@convoform/tracing";
import type { UIMessageStreamWriter } from "ai";
import { saveConversationWithRetry } from "./saveConversation";

type OnUpdateConversationOptions = {
  save?: typeof saveConversationWithRetry;
};

export type OnUpdateConversationHandler = ((
  conversation: CoreConversation,
) => Promise<void>) & {
  /**
   * Persist the latest snapshot. Call this from the stream's `onFinish` hook so
   * the answer is saved before the response closes.
   */
  flush: () => Promise<void>;
};

export function getOnUpdateConversationHandler(
  writer: UIMessageStreamWriter<CoreServiceUIMessage>,
  ctx: ActionContext & {
    tracer?: EdgeTracer;
  },
  options: OnUpdateConversationOptions = {},
): OnUpdateConversationHandler {
  const save = options.save ?? saveConversationWithRetry;

  // The ConversationManager mutates one live object throughout the request.
  // Keep only the latest snapshot and persist it once, before the stream closes.
  let pendingConversation: CoreConversation | null = null;

  const handler = async (updatedConversation: CoreConversation) => {
    try {
      const conversationSnapshot = structuredClone(updatedConversation);
      pendingConversation = conversationSnapshot;

      writer.write({
        type: "data-conversation",
        data: conversationSnapshot,
        id: conversationSnapshot.id,
      });
    } catch (error) {
      await logConversationPatchFailure(updatedConversation, error);
    }
  };

  handler.flush = async () => {
    const snapshotToPatch = pendingConversation;
    pendingConversation = null;

    if (!snapshotToPatch) {
      await ctx.tracer?.flush();
      return;
    }

    try {
      const saved = await save(snapshotToPatch, ctx);

      if (!saved) {
        throw new Error("Failed to persist conversation");
      }
    } catch (error) {
      await logConversationPatchFailure(snapshotToPatch, error);
      throw error;
    } finally {
      await ctx.tracer?.flush();
    }
  };

  return handler;
}

async function logConversationPatchFailure(
  conversation: CoreConversation,
  error: unknown,
) {
  const logger = createConversationLogger({
    conversationId: conversation.id,
    formId: conversation.formId,
    organizationId: conversation.organizationId,
  });

  logger.error("conversation:patch:failed", {
    conversationId: conversation.id,
    error: error instanceof Error ? error.message : String(error),
  });

  try {
    await logger.flush();
  } catch {
    // Logging must never fail the response path.
  }
}
