import type { CoreServiceUIMessage } from "@convoform/ai";
import type { ActionContext } from "@convoform/api/src/types/actionContextType";
import type { CoreConversation } from "@convoform/db/src/schema";
import { createConversationLogger } from "@convoform/logger";
import type { EdgeTracer } from "@convoform/tracing";
import type { UIMessageStreamWriter } from "ai";
import { after } from "next/server";
import { saveConversationWithRetry } from "./saveConversation";

type OnUpdateConversationOptions = {
  scheduleAfter?: (task: () => Promise<void>) => void;
  save?: typeof saveConversationWithRetry;
};

export function getOnUpdateConversationHandler(
  writer: UIMessageStreamWriter<CoreServiceUIMessage>,
  ctx: ActionContext & {
    tracer?: EdgeTracer;
  },
  options: OnUpdateConversationOptions = {},
) {
  const scheduleAfter = options.scheduleAfter ?? after;
  const save = options.save ?? saveConversationWithRetry;

  // The ConversationManager mutates one live object throughout the request.
  // Keep only the latest snapshot and persist it once after the response, so
  // after() never reads a reference that changes underneath it.
  let pendingConversation: CoreConversation | null = null;
  let isPatchScheduled = false;

  return async (updatedConversation: CoreConversation) => {
    try {
      const conversationSnapshot = structuredClone(updatedConversation);
      pendingConversation = conversationSnapshot;

      if (!isPatchScheduled) {
        isPatchScheduled = true;

        scheduleAfter(async () => {
          const snapshotToPatch = pendingConversation;
          pendingConversation = null;
          isPatchScheduled = false;

          if (!snapshotToPatch) {
            return;
          }

          try {
            await save(snapshotToPatch, ctx);
          } catch (error) {
            await logConversationPatchFailure(snapshotToPatch, error);
          } finally {
            await ctx.tracer?.flush();
          }
        });
      }

      writer.write({
        type: "data-conversation",
        data: conversationSnapshot,
        id: conversationSnapshot.id,
      });
    } catch (error) {
      await logConversationPatchFailure(updatedConversation, error);
    }
  };
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
