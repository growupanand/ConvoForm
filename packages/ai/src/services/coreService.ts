import { ConversationManager } from "../managers/conversationManager";
import type { CoreConversation } from "../types";
import {
  ConversationService,
  type ConversationServiceUIMessage,
} from "./conversationService";

/**
 * ============================================
 * --------------- CORE SERVICE ---------------
 * ============================================
 *
 * Orchestrates conversation flow using ConversationService.
 * Handles streaming and auto-updating of conversation data.
 *
 */

export type CoreServiceUIMessage = ConversationServiceUIMessage;

export class CoreService {
  private streamId: string;
  private conversationManager: ConversationManager;
  private conversationService: ConversationService;

  constructor(opts: {
    conversation: CoreConversation;
    /**
     * onUpdateConversation is used to update conversation data in the database
     * If not provided, conversation data will not be updated in the database
     */
    onUpdateConversation?: ConversationManager["onUpdateConversation"];
    /**
     * Stream ID is used to identify the stream in the UI
     * If not provided, conversation ID will be used
     */
    streamId?: CoreService["streamId"];
  }) {
    this.conversationManager = new ConversationManager({
      conversation: opts.conversation,
      onUpdateConversation: this.createConversationUpdateHandler(
        opts.onUpdateConversation,
      ),
    });
    this.streamId = opts.streamId || opts.conversation.id;
    this.conversationService = new ConversationService(
      this.conversationManager,
      this.streamId,
    );
  }

  public async initialize() {
    return this.conversationService.initialize();
  }

  public async process(
    answerText: string,
    currentFieldId: CoreConversation["formFieldResponses"][number]["id"],
  ) {
    return await this.conversationService.process(answerText, currentFieldId);
  }

  /**
   * Creates a handler that updates conversation data and automatically streams it
   */
  private createConversationUpdateHandler(
    originalCallback?: ConversationManager["onUpdateConversation"],
  ) {
    return async (conversation: CoreConversation) => {
      // Call original callback first (database update)
      if (originalCallback) {
        await originalCallback(conversation);
      }
    };
  }
}
