import type { Conversation } from "@convoform/db/src/schema";

export class ConversationManager {
  private conversation: Conversation;
  public onUpdateConversation?: (conversation: Conversation) => Promise<void>;

  constructor(
    conversation: Conversation,
    onUpdateConversation?: ConversationManager["onUpdateConversation"],
  ) {
    this.conversation = conversation;
    this.onUpdateConversation = onUpdateConversation;
  }

  public getConversation() {
    return this.conversation;
  }

  public async updateConversation() {
    let success = false;
    if (this.onUpdateConversation) {
      // We want to make sure that update failed should not prevent the flow to continue
      try {
        console.log(`Updating conversation ${this.conversation.id}`);
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

  public saveFieldAnswer(fieldId: string, fieldValue: string) {
    const field = this.conversation.collectedData.find(
      (field) => field.id === fieldId,
    );
    if (!field) {
      throw new Error("Field not found");
    }
    field.fieldValue = fieldValue;
    this.updateConversation();
  }

  public addUserMessage(message: string) {
    this.conversation.transcript.push({
      role: "user",
      content: message,
    });
    this.updateConversation();
  }

  public addAIMessage(message: string) {
    this.conversation.transcript.push({
      role: "assistant",
      content: message,
    });
    this.updateConversation();
  }

  public getNextEmptyField() {
    return this.conversation.collectedData.find((field) => !field.fieldValue);
  }

  public markConversationComplete() {
    this.conversation.isInProgress = false;
    this.conversation.finishedAt = new Date();
    this.updateConversation();
  }
}
