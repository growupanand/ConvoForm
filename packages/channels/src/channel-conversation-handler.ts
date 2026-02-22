/**
 * ============================================
 * ----- CHANNEL CONVERSATION HANDLER ---------
 * ============================================
 *
 * Bridges channel adapters with the AI conversation engine (CoreService).
 *
 * Key difference from the web flow:
 * - Web: streams responses to the client via UI message streams
 * - Channels: consumes the full stream server-side and returns plain text
 *
 * This is because channels like Telegram/WhatsApp don't support
 * streaming — they send/receive complete messages.
 */

import { CoreService } from "@convoform/ai";
import type { CoreConversation } from "@convoform/db/src/schema";
import type { ChannelMessage } from "./channel";
import type { SessionManager } from "./session-manager";

/**
 * Options for creating/fetching conversations during channel message handling.
 */
export interface ConversationOperations {
  /**
   * Fetch an existing conversation by ID.
   *
   * @param conversationId - The conversation ID to fetch
   * @returns The full CoreConversation object
   */
  getConversation: (conversationId: string) => Promise<CoreConversation>;

  /**
   * Create a new conversation for a form, including channel metadata.
   *
   * @param formId - The form to start a conversation for
   * @param channelInfo - Channel-specific info to attach to the conversation
   * @returns The newly created CoreConversation object
   */
  createConversation: (
    formId: string,
    channelInfo: { channelType: string; channelSenderId: string },
  ) => Promise<CoreConversation>;

  /**
   * Persist a conversation update to the database.
   *
   * @param conversation - The updated conversation object
   */
  updateConversation: (conversation: CoreConversation) => Promise<void>;
}

/**
 * Handles the lifecycle of a channel message through the conversation engine.
 *
 * For each incoming message:
 * 1. Looks up or creates a session (mapping sender → active conversation)
 * 2. Creates a `CoreService` instance
 * 3. Calls `initialize()` (new conversation) or `process()` (existing)
 * 4. Consumes the full AI stream and returns the concatenated text
 *
 * @example
 * ```ts
 * const handler = new ChannelConversationHandler(sessionManager);
 *
 * const responseText = await handler.handleMessage(
 *   { text: "Hello", senderId: "12345", channelType: "telegram" },
 *   {
 *     formId: "form_abc",
 *     operations: {
 *       getConversation: (id) => db.getConversation(id),
 *       createConversation: (formId, info) => db.createConversation(formId, info),
 *       updateConversation: (conv) => db.updateConversation(conv),
 *     },
 *   },
 * );
 *
 * // responseText = "What is your name?"
 * ```
 */
export class ChannelConversationHandler {
  private sessionManager: SessionManager;

  constructor(sessionManager: SessionManager) {
    this.sessionManager = sessionManager;
  }

  /**
   * Process an incoming channel message and return the full AI response.
   *
   * @param message - The parsed incoming channel message
   * @param opts - Form ID and DB operations for conversation CRUD
   * @returns The full AI response text to send back through the channel
   *
   * @example
   * ```ts
   * const text = await handler.handleMessage(
   *   { text: "My email is test@example.com", senderId: "12345", channelType: "telegram" },
   *   { formId: "form_abc", operations: dbOps },
   * );
   * ```
   */
  async handleMessage(
    message: ChannelMessage,
    opts: {
      formId: string;
      operations: ConversationOperations;
    },
  ): Promise<string> {
    const { formId, operations } = opts;
    const { channelType, senderId, text } = message;

    // 1. Look up existing session
    const existingSession = this.sessionManager.getSession(
      channelType,
      senderId,
      formId,
    );

    if (existingSession) {
      return await this.processExistingConversation(
        existingSession.conversationId,
        existingSession.currentFieldId,
        text,
        channelType,
        senderId,
        formId,
        operations,
      );
    }

    // 2. No session — start a new conversation
    return await this.initializeNewConversation(
      channelType,
      senderId,
      formId,
      operations,
    );
  }

  /**
   * Initialize a new conversation and return the first question.
   */
  private async initializeNewConversation(
    channelType: string,
    senderId: string,
    formId: string,
    operations: ConversationOperations,
  ): Promise<string> {
    const conversation = await operations.createConversation(formId, {
      channelType,
      channelSenderId: senderId,
    });

    const coreService = new CoreService({
      conversation,
      onUpdateConversation: operations.updateConversation,
    });

    const stream = await coreService.initialize();
    const responseText = await this.consumeStream(stream);

    // Update session with the conversation context
    const updatedConversation = await operations.getConversation(
      conversation.id,
    );

    this.sessionManager.setSession(channelType, senderId, formId, {
      conversationId: conversation.id,
      currentFieldId: updatedConversation.currentFieldId,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
    });

    return responseText;
  }

  /**
   * Process a user answer in an existing conversation.
   */
  private async processExistingConversation(
    conversationId: string,
    currentFieldId: string | null,
    answerText: string,
    channelType: string,
    senderId: string,
    formId: string,
    operations: ConversationOperations,
  ): Promise<string> {
    const conversation = await operations.getConversation(conversationId);

    // Conversation already completed — clean up session
    if (conversation.finishedAt) {
      this.sessionManager.deleteSession(channelType, senderId, formId);
      return "This form has already been completed. Thank you!";
    }

    if (!currentFieldId) {
      throw new Error(
        `Session exists but currentFieldId is null for conversation ${conversationId}`,
      );
    }

    const coreService = new CoreService({
      conversation,
      onUpdateConversation: operations.updateConversation,
    });

    const stream = await coreService.process(answerText, currentFieldId);
    const responseText = await this.consumeStream(stream);

    // Re-fetch conversation to get the updated state
    const updatedConversation =
      await operations.getConversation(conversationId);

    // If conversation is complete, clean up the session
    if (updatedConversation.finishedAt) {
      this.sessionManager.deleteSession(channelType, senderId, formId);
    } else {
      // Update session with new currentFieldId
      this.sessionManager.setSession(channelType, senderId, formId, {
        conversationId,
        currentFieldId: updatedConversation.currentFieldId,
        createdAt:
          this.sessionManager.getSession(channelType, senderId, formId)
            ?.createdAt ?? new Date(),
        lastAccessedAt: new Date(),
      });
    }

    return responseText;
  }

  /**
   * Consume a UI message stream and concatenate all text deltas into a single string.
   *
   * This is the key difference from the web flow — instead of streaming to the
   * client, we collect the full response server-side for channel delivery.
   *
   * @param stream - The async iterable stream from CoreService
   * @returns The full concatenated text response
   *
   * @example
   * ```ts
   * const stream = await coreService.initialize();
   * const text = await this.consumeStream(stream);
   * // text = "What is your name?"
   * ```
   */
  private async consumeStream(stream: AsyncIterable<unknown>): Promise<string> {
    let fullText = "";

    for await (const chunk of stream) {
      if (
        typeof chunk === "object" &&
        chunk !== null &&
        "type" in chunk &&
        (chunk as { type: string }).type === "text-delta" &&
        "delta" in chunk
      ) {
        fullText += (chunk as { delta: string }).delta;
      }
    }

    return fullText;
  }
}
