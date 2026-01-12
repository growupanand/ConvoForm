import type { CoreConversation } from "@convoform/db/src/schema";
import { type ILogger, createConversationLogger } from "@convoform/logger";
import type { EdgeTracer } from "@convoform/tracing";

/**
 * Manages a conversation object and provides methods to update it in the database.
 * @class ConversationManager
 */
export class ConversationManager {
  /**
   * The conversation object managed by this class.
   * @type {CoreConversation}
   * @private
   */
  private conversation: CoreConversation;

  /**
   * The callback function to call when the conversation is updated.
   * @type {((conversation: CoreConversation) => Promise<void>) | undefined}
   * @private
   */
  private onUpdateConversation?: (
    conversation: CoreConversation,
  ) => Promise<void>;

  /**
   * Logger instance with conversation context
   * @type {ILogger}
   * @private
   */
  private logger: ILogger;

  private tracer?: EdgeTracer;

  /**
   * Initializes the ConversationManager.
   * @constructor
   * @param {Object} opts - The options to initialize the ConversationManager.
   * @param {CoreConversation} opts.conversation - The conversation object to manage.
   * @param {(conversation: CoreConversation) => Promise<void>} [opts.onUpdateConversation] - The callback function to call when the conversation is updated.
   */
  constructor(opts: {
    conversation: CoreConversation;
    onUpdateConversation?: ConversationManager["onUpdateConversation"];
    tracer?: EdgeTracer;
  }) {
    this.conversation = opts.conversation;
    this.onUpdateConversation = opts.onUpdateConversation;
    this.tracer = opts.tracer;

    // Create logger with conversation context
    this.logger = createConversationLogger({
      conversationId: opts.conversation.id,
      formId: opts.conversation.form.id,
      organizationId: opts.conversation.organizationId,
    });

    this.logger.debug("ConversationManager initialized", {
      fieldCount: opts.conversation.formFieldResponses.length,
      isInProgress: opts.conversation.isInProgress,
    });
  }

  /**
   * Gets the conversation object managed by this class.
   * @returns {CoreConversation} The conversation object.
   */
  public getConversation() {
    return this.conversation;
  }

  /**
   * Updates the conversation object in the database.
   * @returns {Promise<void>} A promise that resolves when the conversation is updated.
   */
  public async updateConversation() {
    let success = false;
    if (this.onUpdateConversation) {
      const timer = this.logger.startTimer("manager.updateConversation");
      const updateConversationSpan = this.tracer?.startSpan(
        "update_conversation",
      );

      // We want to make sure that update failed should not prevent the flow to continue
      try {
        await this.onUpdateConversation(this.conversation);
        success = true;

        timer.end({ success: true });
        updateConversationSpan?.end();
      } catch (error) {
        timer.end({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
        updateConversationSpan?.setStatus("error");
        updateConversationSpan?.end();
      }
    }
    return success;
  }

  /**
   * Updates the current field ID in the conversation object and updates it in the database.
   * @param {string} fieldId - The ID of the current field.
   * @returns {Promise<void>} A promise that resolves when the conversation is updated.
   */
  public async updateCurrentFieldId(fieldId: string) {
    this.logger.info("Updating current field", {
      fieldId,
      previousFieldId: this.conversation.currentFieldId,
    });

    this.conversation.currentFieldId = fieldId;
    await this.updateConversation();
  }

  /**
   * Saves the answer of a field in the conversation object and updates it in the database.
   * @param {string} fieldId - The ID of the field.
   * @param {string} fieldValue - The answer of the field.
   * @returns {Promise<void>} A promise that resolves when the conversation is updated.
   */
  public async saveFieldAnswer(fieldId: string, fieldValue: string) {
    const field = this.conversation.formFieldResponses.find(
      (field) => field.id === fieldId,
    );

    if (!field) {
      this.logger.error("Field not found", { fieldId });
      throw new Error("Field not found");
    }

    this.logger.info("Saving field answer", {
      fieldId,
      fieldName: field.fieldName,
      fieldType: field.fieldConfiguration.inputType,
      answerLength: fieldValue.length,
    });

    field.fieldValue = fieldValue;
    await this.updateConversation();
  }

  /**
   * Adds a user message to the conversation object and updates it in the database.
   * @param {string} message - The user message.
   * @returns {Promise<void>} A promise that resolves when the conversation is updated.
   */
  public async addUserMessage(message: string) {
    this.logger.debug("Adding user message", {
      messageLength: message.length,
      transcriptLength: this.conversation.transcript.length + 1,
    });

    this.conversation.transcript.push({
      role: "user",
      content: message,
    });
    await this.updateConversation();
  }

  /**
   * Adds an AI message to the conversation object and updates it in the database.
   * @param {string} message - The AI message.
   * @returns {Promise<void>} A promise that resolves when the conversation is updated.
   */
  public async addAIMessage(message: string) {
    this.logger.debug("Adding AI message", {
      messageLength: message.length,
      transcriptLength: this.conversation.transcript.length + 1,
    });

    this.conversation.transcript.push({
      role: "assistant",
      content: message,
    });
    await this.updateConversation();
  }

  /**
   * Gets the next empty field in the conversation object.
   * @returns {CoreConversation["formFieldResponses"][number] | undefined} The next empty field or undefined if there is no empty field.
   */
  public getNextEmptyField() {
    return this.conversation.formFieldResponses.find(
      (field) => !field.fieldValue,
    );
  }

  /**
   * Checks if the conversation is complete.
   * @returns {boolean} True if the conversation is complete, false otherwise.
   */
  public checkConversationIsComplete() {
    return this.conversation.finishedAt !== null;
  }

  /**
   * Marks the conversation as complete and updates it in the database.
   * @returns {Promise<void>} A promise that resolves when the conversation is updated.
   */
  public async markConversationComplete() {
    this.logger.info("Marking conversation as complete", {
      totalFields: this.conversation.formFieldResponses.length,
      filledFields: this.conversation.formFieldResponses.filter(
        (f) => f.fieldValue,
      ).length,
      transcriptLength: this.conversation.transcript.length,
    });

    this.conversation.isInProgress = false;
    this.conversation.finishedAt = new Date();
    await this.updateConversation();
  }

  /**
   * Gets a field by its ID.
   * @param {string} fieldId - The ID of the field.
   * @returns {CoreConversation["formFieldResponses"][number] | undefined} The field or undefined if the field is not found.
   */
  public getFieldById(fieldId: string) {
    return this.conversation.formFieldResponses.find(
      (field) => field.id === fieldId,
    );
  }

  /**
   * Updates the name of the conversation object and updates it in the database.
   * @param {string} name - The new name of the conversation.
   * @returns {Promise<void>} A promise that resolves when the conversation is updated.
   */
  public async updateConversationName(name: string) {
    this.logger.info("Updating conversation name", {
      newName: name,
      previousName: this.conversation.name,
    });

    this.conversation.name = name;
    await this.updateConversation();
  }
}
