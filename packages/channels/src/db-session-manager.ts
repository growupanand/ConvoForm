/**
 * ============================================
 * --------- DB SESSION MANAGER ---------------
 * ============================================
 *
 * Database-backed session manager for serverless environments.
 *
 * Instead of holding sessions in memory (which is lost between
 * serverless invocations), this queries the `conversation` table
 * for active (non-finished) conversations matching the channel
 * user's identity.
 *
 * No new tables needed — all session data already exists in the
 * conversation table: `channelType`, `channelSenderId`, `currentFieldId`,
 * `finishedAt`.
 */

import { db as defaultDb } from "@convoform/db";
import type { SessionData, SessionManager } from "./session-manager";

/**
 * DB-backed session manager for serverless environments.
 *
 * Queries the `conversation` table for the most recent active (non-finished)
 * conversation matching `(channelType, channelSenderId, formId)`.
 *
 * `setSession` and `deleteSession` are no-ops because the conversation
 * lifecycle is already managed by `ConversationOperations` — the DB is
 * the source of truth.
 *
 * @example
 * ```ts
 * import { DbSessionManager } from "@convoform/channels";
 *
 * const sessionManager = new DbSessionManager();
 * const session = await sessionManager.getSession("telegram", "12345", "form_abc");
 * if (session) {
 *   console.log("Active conversation:", session.conversationId);
 * }
 * ```
 */
export class DbSessionManager implements SessionManager {
  private db: typeof defaultDb;

  constructor(db: typeof defaultDb = defaultDb) {
    this.db = db;
  }

  /**
   * Look up an active session by querying the conversation table.
   *
   * Finds the most recent non-finished conversation for the given
   * channel type, sender ID, and form ID.
   *
   * @param channelType - The channel type (e.g., 'telegram')
   * @param senderId - The channel-specific user ID
   * @param formId - The form ID
   * @returns The session data if an active conversation exists, undefined otherwise
   *
   * @example
   * ```ts
   * const session = await manager.getSession("telegram", "12345", "form_abc");
   * if (session) {
   *   console.log("Resume conversation:", session.conversationId);
   * }
   * ```
   */
  async getSession(
    channelType: string,
    senderId: string,
    formId: string,
  ): Promise<SessionData | undefined> {
    const conversation = await this.db.query.conversation.findFirst({
      where: (table, { and, eq, isNull }) =>
        and(
          eq(table.channelType, channelType),
          eq(table.channelSenderId, senderId),
          eq(table.formId, formId),
          isNull(table.finishedAt),
        ),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      columns: {
        id: true,
        currentFieldId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!conversation) {
      return undefined;
    }

    return {
      conversationId: conversation.id,
      currentFieldId: conversation.currentFieldId,
      createdAt: conversation.createdAt,
      lastAccessedAt: conversation.updatedAt,
    };
  }

  /**
   * No-op — the DB is already updated by ConversationOperations.
   * Session state is derived from the conversation table.
   */
  setSession(
    _channelType: string,
    _senderId: string,
    _formId: string,
    _data: SessionData,
  ): void {
    // No-op: DB is the source of truth for session state.
    // ConversationOperations.updateConversation() already persists
    // the conversation (and thus the session) after each message.
  }

  /**
   * No-op — session lifecycle is managed by `finishedAt` in the
   * conversation table. When a conversation completes, `finishedAt`
   * is set and `getSession` will no longer return it.
   */
  deleteSession(
    _channelType: string,
    _senderId: string,
    _formId: string,
  ): boolean {
    // No-op: session cleanup happens naturally via finishedAt.
    return true;
  }
}
