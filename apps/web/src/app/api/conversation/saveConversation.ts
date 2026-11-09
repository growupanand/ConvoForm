import { patchConversation } from "@convoform/api/src/actions/conversation";
import { env } from "@convoform/api/src/env";
import type { ActionContext } from "@convoform/api/src/types/actionContextType";
import { createDb } from "@convoform/db";
import type { Conversation, CoreConversation } from "@convoform/db/src/schema";
import { type ILogger, createConversationLogger } from "@convoform/logger";
import { getAPIDomainUrl } from "@convoform/websocket-client";

export const CONVERSATION_PATCH_TIMEOUT_MS = 15_000;

export class ConversationPatchTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Conversation patch timed out after ${timeoutMs}ms`);
    this.name = "ConversationPatchTimeoutError";
  }
}

type SaveConversationOptions = {
  /** Timeout for the first save attempt. */
  timeoutMs?: number;
  /** Timeout for the single retry. Defaults to the first attempt timeout. */
  retryTimeoutMs?: number;
  patch?: typeof patchConversation;
  createFreshDb?: typeof createDb;
  onConversationUpdated?: (
    conversation: Pick<Conversation, "id" | "formId">,
  ) => void | Promise<void>;
};

function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new ConversationPatchTimeoutError(timeoutMs));
    }, timeoutMs);

    operation.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function flushLogger(logger: ILogger) {
  try {
    await logger.flush();
  } catch {
    // Logging must never fail the save path.
  }
}

function getConversationLogger(
  conversation: Pick<CoreConversation, "id" | "formId" | "organizationId">,
) {
  return createConversationLogger({
    conversationId: conversation.id,
    formId: conversation.formId,
    organizationId: conversation.organizationId,
  });
}

/**
 * Persist a conversation snapshot after the stream has finished.
 *
 * Saves are idempotent full snapshots, so a timed-out or failed first attempt
 * is retried once on a brand-new connection/pool.
 */
export async function saveConversationWithRetry(
  conversation: CoreConversation,
  ctx: ActionContext,
  options: SaveConversationOptions = {},
) {
  const timeoutMs = options.timeoutMs ?? CONVERSATION_PATCH_TIMEOUT_MS;
  const retryTimeoutMs = options.retryTimeoutMs ?? timeoutMs;
  const patch = options.patch ?? patchConversation;
  const createFreshDb = options.createFreshDb ?? createDb;
  const onConversationUpdated =
    options.onConversationUpdated ?? broadcastConversationUpdated;
  const logger = getConversationLogger(conversation);

  const trySave = async (db: ActionContext["db"], attemptTimeoutMs: number) => {
    try {
      await withTimeout(
        patch(conversation, { ...ctx, db }, { onConversationUpdated }),
        attemptTimeoutMs,
      );

      logger.info("conversation:patch:ok", {
        conversationId: conversation.id,
        transcriptLength: conversation.transcript.length,
        finished: Boolean(conversation.finishedAt),
      });

      return true;
    } catch (error) {
      if (error instanceof ConversationPatchTimeoutError) {
        logger.error("conversation:patch:timeout", {
          conversationId: conversation.id,
          hasFinishedAt: Boolean(conversation.finishedAt),
        });
      } else {
        logger.error("conversation:patch:failed", {
          conversationId: conversation.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      return false;
    } finally {
      await flushLogger(logger);
    }
  };

  if (await trySave(ctx.db, timeoutMs)) {
    return true;
  }

  logger.warn("conversation:patch:retry", {
    conversationId: conversation.id,
  });
  await flushLogger(logger);

  let freshDb: ReturnType<typeof createDb> | undefined;

  try {
    freshDb = createFreshDb();
    return await trySave(freshDb.db, retryTimeoutMs);
  } catch (error) {
    logger.error("conversation:patch:retry:failed", {
      conversationId: conversation.id,
      error: error instanceof Error ? error.message : String(error),
    });
    await flushLogger(logger);
    return false;
  } finally {
    if (freshDb) {
      try {
        await freshDb.pool.end();
      } catch {
        // Closing the retry pool must never fail the response path.
      }
    }
  }
}

export async function broadcastConversationUpdated(
  conversation: Pick<Conversation, "id" | "formId">,
) {
  const secret = env.INTERNAL_EMAIL_API_SECRET;

  if (!secret) {
    return;
  }

  const websocketUrl = getAPIDomainUrl();
  const httpUrl = websocketUrl.replace(/^ws/, "http").replace(/\/$/, "");
  const logger = createConversationLogger({
    conversationId: conversation.id,
    formId: conversation.formId,
  });

  try {
    const response = await fetch(`${httpUrl}/broadcast`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        rooms: [
          `conversation:${conversation.id}`,
          `form:${conversation.formId}`,
        ],
        message: { type: "conversation:updated" },
      }),
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      logger.warn("conversation:broadcast:failed", {
        conversationId: conversation.id,
        formId: conversation.formId,
        status: response.status,
      });
      await flushLogger(logger);
    }
  } catch (error) {
    logger.warn("conversation:broadcast:failed", {
      conversationId: conversation.id,
      formId: conversation.formId,
      error: error instanceof Error ? error.message : String(error),
    });
    await flushLogger(logger);
  }
}
