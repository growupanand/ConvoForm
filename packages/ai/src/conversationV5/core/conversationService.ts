import { shouldSkipValidation } from "@convoform/db/src/schema/formFields/utils";
import {
  type AsyncIterableStream,
  type InferUIMessageChunk,
  type UIMessage,
  createUIMessageStream,
} from "ai";
import { extractFieldAnswer } from "../ai-actions/extractFieldAnswer";
import { streamFieldQuestion } from "../ai-actions/streamFieldQuestion";
import type { Conversation } from "../types";
import type { ConversationManager } from "./managers/conversationManager";

export type ConversationServiceUIMessage = UIMessage<
  never, // metadata type
  {
    conversation?: Conversation;
  }
>;

/**
 * ============================================
 * ----------- CONVERSATION SERVICE -----------
 * ============================================
 *
 * Handles the core conversation orchestration logic.
 *
 * orchestrateConversation() handles below flows when user submits answer:
 *
 * 1. Invalid answer:
 *    - Generate and stream followup question
 *
 * 2. Valid answer and next field exists:
 *    - Save answer
 *    - Generate and stream question for next field
 *
 * 3. Valid answer and no next field:
 *    - Save answer
 *    - Mark conversation as complete
 *    - Add end message to transcript and stream it
 *
 */

export class ConversationService {
  private conversationManager: ConversationManager;
  private streamId: string;
  private endMessage = "Form completed successfully!";

  constructor(conversationManager: ConversationManager, streamId: string) {
    this.conversationManager = conversationManager;
    this.streamId = streamId;
  }

  /**
   * Orchestrates the conversation flow based on user answer
   */
  public async process(
    answerText: string,
    currentField: Conversation["collectedData"][number],
  ): Promise<
    AsyncIterableStream<InferUIMessageChunk<ConversationServiceUIMessage>>
  > {
    let validatedAnswer: {
      object: { isValid: boolean; answer: string | null };
    };

    const sanitizedAnswerText = answerText.trim();

    if (!sanitizedAnswerText) {
      throw new Error("Answer cannot be empty");
    }

    await this.conversationManager.updateCurrentFieldId(currentField.id);
    await this.conversationManager.addUserMessage(sanitizedAnswerText);

    // Check if we should skip validation for this field type
    const skipValidation = shouldSkipValidation(
      currentField.fieldConfiguration.inputType,
    );

    if (skipValidation) {
      validatedAnswer = {
        object: {
          isValid: true,
          answer: sanitizedAnswerText,
        },
      };
    } else {
      validatedAnswer = await extractFieldAnswer({
        ...this.conversationManager.getConversation(),
        currentField,
      });
    }

    // 1. Invalid answer: Generate and stream followup question
    if (!validatedAnswer.object.isValid || !validatedAnswer.object.answer) {
      return this.generateFollowupQuestionStream(currentField);
    }

    // 2. Valid answer and next field exists: Save answer and generate and stream question for next field
    this.conversationManager.saveFieldAnswer(
      currentField.id,
      validatedAnswer.object.answer,
    );
    const nextField = this.conversationManager.getNextEmptyField();

    if (nextField) {
      return this.generateNextFieldQuestionStream(nextField);
    }

    // 3. Valid answer and no next field: Save answer, mark conversation as complete
    return this.generateEndConversationStream();
  }

  /**
   * Generates a followup question for invalid answers
   */
  private generateFollowupQuestionStream(
    currentField: Conversation["collectedData"][number],
  ): AsyncIterableStream<InferUIMessageChunk<ConversationServiceUIMessage>> {
    const streamTextResult = streamFieldQuestion(
      {
        ...this.conversationManager.getConversation(),
        currentField,
        isFirstQuestion: false,
      },
      this.createTextStreamFinishHandler(),
    );

    return streamTextResult.toUIMessageStream<ConversationServiceUIMessage>({
      onFinish: async () => {
        await this.conversationManager.addAIMessage(
          await streamTextResult.text,
        );
      },
    });
  }

  /**
   * Generates a question for the next field
   */
  private generateNextFieldQuestionStream(
    nextField: Conversation["collectedData"][number],
  ): AsyncIterableStream<InferUIMessageChunk<ConversationServiceUIMessage>> {
    this.conversationManager.updateCurrentFieldId(nextField.id);
    const streamTextResult = streamFieldQuestion(
      {
        ...this.conversationManager.getConversation(),
        currentField: nextField,
        isFirstQuestion: true,
      },
      this.createTextStreamFinishHandler(),
    );

    return streamTextResult.toUIMessageStream<ConversationServiceUIMessage>({
      onFinish: async () => {
        await this.conversationManager.addAIMessage(
          await streamTextResult.text,
        );
      },
    });
  }

  /**
   * Completes the conversation and returns end message stream
   */
  private generateEndConversationStream(): AsyncIterableStream<
    InferUIMessageChunk<ConversationServiceUIMessage>
  > {
    this.conversationManager.addAIMessage(this.endMessage);
    this.conversationManager.markConversationComplete();

    // Create fake end message stream
    return createUIMessageStream<ConversationServiceUIMessage>({
      execute: async ({ writer }) => {
        writer.write({
          type: "text-start",
          id: this.streamId,
        });
        writer.write({
          type: "text-delta",
          delta: this.endMessage,
          id: this.streamId,
        });
        writer.write({
          type: "text-end",
          id: this.streamId,
        });
      },
    });
  }

  /**
   * Creates a streaming callback that will be called when text streaming ends
   * this will prevent streaming from ending before we have a chance to do something,
   * E.g. sending final stream message or updating conversation data in the database
   */
  private createTextStreamFinishHandler() {
    return async () => {
      await this.conversationManager.updateConversation();
    };
  }
}
