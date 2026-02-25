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
import { getLogger } from "@convoform/logger";
import type { ILogger } from "@convoform/logger";
import type { EdgeTracer } from "@convoform/tracing";
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
    channelInfo: {
      channelType: string;
      channelSenderId: string;
      metadata?: Record<string, unknown>;
    },
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
  private logger: ILogger;
  private tracer?: EdgeTracer;

  constructor(
    sessionManager: SessionManager,
    logger?: ILogger,
    tracer?: EdgeTracer,
  ) {
    this.sessionManager = sessionManager;
    this.logger = (logger ?? getLogger()).withContext({
      component: "channels",
      module: "conversation-handler",
    });
    this.tracer = tracer;
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

    const timer = this.logger.startTimer("handle_message", {
      channelType,
      senderId,
      formId,
    });

    // 1. Look up existing session (may be async for DB-backed session managers)
    const existingSession = await this.sessionManager.getSession(
      channelType,
      senderId,
      formId,
    );
    timer.checkpoint("session_lookup");

    if (existingSession) {
      // Create a conversation-scoped logger with conversationId
      const conversationLogger = this.logger.withContext({
        conversationId: existingSession.conversationId,
      });

      conversationLogger.debug("Resuming existing conversation", {
        conversationId: existingSession.conversationId,
        channelType,
        senderId,
        formId,
      });

      // Set trace ID to conversationId so all spans share one trace
      this.tracer?.setTraceId(existingSession.conversationId);

      const result = await this.processExistingConversation(
        existingSession.conversationId,
        existingSession.currentFieldId,
        text,
        channelType,
        senderId,
        formId,
        operations,
        timer,
        conversationLogger,
      );

      timer.end({ isNewConversation: false });
      await this.tracer?.flush();
      return result;
    }

    // 2. No session — start a new conversation
    this.logger.info("Starting new conversation", {
      channelType,
      senderId,
      formId,
    });

    const result = await this.initializeNewConversation(
      message,
      formId,
      operations,
      timer,
    );

    timer.end({ isNewConversation: true });
    await this.tracer?.flush();
    return result;
  }

  /**
   * Initialize a new conversation and return the first question.
   */
  private async initializeNewConversation(
    message: ChannelMessage,
    formId: string,
    operations: ConversationOperations,
    timer: ReturnType<ILogger["startTimer"]>,
  ): Promise<string> {
    const { channelType, senderId, metadata } = message;

    const conversation = await operations.createConversation(formId, {
      channelType,
      channelSenderId: senderId,
      metadata,
    });
    timer.checkpoint("conversation_created");

    // Now that we have the conversationId, set trace ID and create scoped logger
    this.tracer?.setTraceId(conversation.id);
    const conversationLogger = this.logger.withContext({
      conversationId: conversation.id,
    });

    conversationLogger.info("New conversation created", {
      conversationId: conversation.id,
      channelType,
      senderId,
      formId,
    });

    const coreService = new CoreService({
      conversation,
      onUpdateConversation: operations.updateConversation,
      tracer: this.tracer,
    });

    const stream = await coreService.initialize();
    const responseText = await this.consumeStream(stream);
    timer.checkpoint("ai_stream_consumed");

    // Update session with the conversation context
    const updatedConversation = await operations.getConversation(
      conversation.id,
    );

    await this.sessionManager.setSession(channelType, senderId, formId, {
      conversationId: conversation.id,
      currentFieldId: updatedConversation.currentFieldId,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
    });
    timer.checkpoint("session_updated");

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
    timer: ReturnType<ILogger["startTimer"]>,
    conversationLogger: ILogger,
  ): Promise<string> {
    const conversation = await operations.getConversation(conversationId);
    timer.checkpoint("conversation_fetched");

    // Conversation already completed — clean up session
    if (conversation.finishedAt) {
      await this.sessionManager.deleteSession(channelType, senderId, formId);

      conversationLogger.info("Conversation already completed", {
        conversationId,
        channelType,
        senderId,
      });

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
      tracer: this.tracer,
    });

    const stream = await coreService.process(answerText, currentFieldId);
    const responseText = await this.consumeStream(stream);
    timer.checkpoint("ai_stream_consumed");

    // Re-fetch conversation to get the updated state
    const updatedConversation =
      await operations.getConversation(conversationId);

    // If conversation is complete, clean up the session
    if (updatedConversation.finishedAt) {
      await this.sessionManager.deleteSession(channelType, senderId, formId);

      conversationLogger.info("Conversation completed", {
        conversationId,
        channelType,
        senderId,
        formId,
      });
    } else {
      // Update session with new currentFieldId
      const existingSession = await this.sessionManager.getSession(
        channelType,
        senderId,
        formId,
      );
      await this.sessionManager.setSession(channelType, senderId, formId, {
        conversationId,
        currentFieldId: updatedConversation.currentFieldId,
        createdAt: existingSession?.createdAt ?? new Date(),
        lastAccessedAt: new Date(),
      });
    }
    timer.checkpoint("session_updated");

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
