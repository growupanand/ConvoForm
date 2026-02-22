/**
 * ============================================
 * ------------- SESSION MANAGER --------------
 * ============================================
 *
 * Manages active conversation sessions for channel users.
 * Since channel messages are stateless webhooks (unlike the web widget
 * which maintains state client-side), we need server-side session tracking.
 *
 * Phase 1: In-memory Map (development/single-instance)
 * Phase 4: Redis (production/multi-instance)
 */

/**
 * Data stored for each active session.
 */
export interface SessionData {
  /** The ID of the active conversation */
  conversationId: string;
  /** The ID of the field currently being asked about */
  currentFieldId: string | null;
  /** When this session was created */
  createdAt: Date;
  /** When this session was last accessed */
  lastAccessedAt: Date;
}

/**
 * Builds a composite key from channel type, sender ID, and form ID.
 *
 * @param channelType - The channel type (e.g., 'telegram')
 * @param senderId - The channel-specific user ID
 * @param formId - The form being filled
 * @returns A composite string key
 *
 * @example
 * ```ts
 * buildSessionKey("telegram", "123456", "form_abc")
 * // => "telegram:123456:form_abc"
 * ```
 */
function buildSessionKey(
  channelType: string,
  senderId: string,
  formId: string,
): string {
  return `${channelType}:${senderId}:${formId}`;
}

/**
 * In-memory session manager for tracking active channel conversations.
 *
 * Maps `{channelType, senderId, formId}` → `SessionData` to track which
 * conversation a channel user is currently engaged in.
 *
 * @example
 * ```ts
 * const sessionManager = new SessionManager();
 *
 * // Create a new session
 * sessionManager.setSession("telegram", "123456", "form_abc", {
 *   conversationId: "conv_xyz",
 *   currentFieldId: "field_1",
 *   createdAt: new Date(),
 *   lastAccessedAt: new Date(),
 * });
 *
 * // Retrieve it later
 * const session = sessionManager.getSession("telegram", "123456", "form_abc");
 * ```
 */
export class SessionManager {
  private sessions: Map<string, SessionData> = new Map();

  /**
   * Retrieve an active session.
   *
   * @param channelType - The channel type (e.g., 'telegram')
   * @param senderId - The channel-specific user ID
   * @param formId - The form ID
   * @returns The session data if found, undefined otherwise
   *
   * @example
   * ```ts
   * const session = manager.getSession("telegram", "12345", "form_abc");
   * if (session) {
   *   console.log("Active conversation:", session.conversationId);
   * }
   * ```
   */
  getSession(
    channelType: string,
    senderId: string,
    formId: string,
  ): SessionData | undefined {
    const key = buildSessionKey(channelType, senderId, formId);
    const session = this.sessions.get(key);
    if (session) {
      session.lastAccessedAt = new Date();
    }
    return session;
  }

  /**
   * Create or update a session.
   *
   * @param channelType - The channel type
   * @param senderId - The channel-specific user ID
   * @param formId - The form ID
   * @param data - The session data to store
   *
   * @example
   * ```ts
   * manager.setSession("telegram", "12345", "form_abc", {
   *   conversationId: "conv_xyz",
   *   currentFieldId: "field_1",
   *   createdAt: new Date(),
   *   lastAccessedAt: new Date(),
   * });
   * ```
   */
  setSession(
    channelType: string,
    senderId: string,
    formId: string,
    data: SessionData,
  ): void {
    const key = buildSessionKey(channelType, senderId, formId);
    this.sessions.set(key, data);
  }

  /**
   * Delete a session (e.g., when a conversation is completed).
   *
   * @param channelType - The channel type
   * @param senderId - The channel-specific user ID
   * @param formId - The form ID
   * @returns true if a session was deleted, false if no session existed
   *
   * @example
   * ```ts
   * const deleted = manager.deleteSession("telegram", "12345", "form_abc");
   * // deleted === true if the session existed
   * ```
   */
  deleteSession(
    channelType: string,
    senderId: string,
    formId: string,
  ): boolean {
    const key = buildSessionKey(channelType, senderId, formId);
    return this.sessions.delete(key);
  }

  /**
   * Remove all sessions older than the specified max age.
   *
   * @param maxAgeMs - Maximum session age in milliseconds
   * @returns The number of sessions that were cleared
   *
   * @example
   * ```ts
   * // Clear sessions older than 1 hour
   * const cleared = manager.clearExpiredSessions(60 * 60 * 1000);
   * console.log(`Cleared ${cleared} expired sessions`);
   * ```
   */
  clearExpiredSessions(maxAgeMs: number): number {
    const now = Date.now();
    let cleared = 0;

    for (const [key, session] of this.sessions) {
      if (now - session.lastAccessedAt.getTime() > maxAgeMs) {
        this.sessions.delete(key);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Get the total number of active sessions.
   *
   * @returns The count of active sessions
   *
   * @example
   * ```ts
   * console.log(`Active sessions: ${manager.size}`);
   * ```
   */
  get size(): number {
    return this.sessions.size;
  }
}
