import type { CoreConversation } from "@convoform/db/src/schema";

export class ConversationManager {
  private conversation: CoreConversation;
  private onUpdateConversation?: (
    conversation: CoreConversation,
  ) => Promise<void>;

  constructor(opts: {
    conversation: CoreConversation;
    onUpdateConversation?: ConversationManager["onUpdateConversation"];
  }) {
    this.conversation = opts.conversation;
    this.onUpdateConversation = opts.onUpdateConversation;
  }

  public getConversation() {
    return this.conversation;
  }

  public async updateConversation() {
    let success = false;
    if (this.onUpdateConversation) {
      // We want to make sure that update failed should not prevent the flow to continue
      try {
        await this.onUpdateConversation(this.conversation);
        success = true;
      } catch (error) {
        console.error(
          `Failed to update conversation ${this.conversation.id}`,
          error,
        );
      }
    }
    return success;
  }

  public async updateCurrentFieldId(fieldId: string) {
    this.conversation.currentFieldId = fieldId;
    await this.updateConversation();
  }

  public async saveFieldAnswer(fieldId: string, fieldValue: string) {
    const field = this.conversation.formFieldResponses.find(
      (field) => field.id === fieldId,
    );
    if (!field) {
      throw new Error("Field not found");
    }
    field.fieldValue = fieldValue;
    await this.updateConversation();
  }

  public async addUserMessage(message: string) {
    this.conversation.transcript.push({
      role: "user",
      content: message,
    });
    await this.updateConversation();
  }

  public async addAIMessage(message: string) {
    this.conversation.transcript.push({
      role: "assistant",
      content: message,
    });
    await this.updateConversation();
  }

  public getNextEmptyField() {
    return this.conversation.formFieldResponses.find(
      (field) => !field.fieldValue,
    );
  }

  public async markConversationComplete() {
    this.conversation.isInProgress = false;
    this.conversation.finishedAt = new Date();
    await this.updateConversation();
  }

  public getFieldById(fieldId: string) {
    return this.conversation.formFieldResponses.find(
      (field) => field.id === fieldId,
    );
  }

  public checkConversationIsComplete() {
    return this.conversation.finishedAt !== null;
  }
}
