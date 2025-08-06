import type { Conversation } from "@convoform/db/src/schema";
import { shouldSkipValidation } from "@convoform/db/src/schema/formFields/utils";
import {
  type UIMessage,
  type UIMessageStreamWriter,
  createUIMessageStream,
} from "ai";
import { extractFieldAnswer } from "../ai-actions/extractFieldAnswer";
import { streamFieldQuestion } from "../ai-actions/streamFieldQuestion";
import { ConversationManager } from "./managers/conversationManager";

export type ConversationUIMessage = UIMessage<
  never, // metadata type
  {
    conversation: Conversation;
  }
>;

export class ConversationService {
  private conversationId: string;
  private streamId: string;
  private conversationManager: ConversationManager;
  private endMessage = "Form completed successfully!";

  constructor(
    conversation: Conversation,
    opts: {
      onUpdateConversation?: ConversationManager["onUpdateConversation"];
      streamWriter?: UIMessageStreamWriter;
    } = {},
  ) {
    this.conversationManager = new ConversationManager(
      conversation,
      opts.onUpdateConversation,
    );
    this.conversationId = conversation.id;
    this.streamId = `stream-${this.conversationId}`;
  }

  public async generateInitialQuestion() {
    // Get the first empty field to start the conversation
    const firstField = this.conversationManager.getNextEmptyField();

    if (!firstField) {
      // If no fields to fill, return completion message
      this.conversationManager.addAIMessage(this.endMessage);
      this.conversationManager.markConversationComplete();

      const endMessageStream = createUIMessageStream({
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

      return endMessageStream;
    }

    // Generate question for the first field
    const questionStreamTextResult = streamFieldQuestion({
      ...this.conversationManager.getConversation(),
      currentField: firstField,
      isFirstQuestion: true,
    });

    return questionStreamTextResult.toUIMessageStream({
      generateMessageId: () => {
        return this.streamId;
      },
      onFinish: async () => {
        const completeQuestionText = await questionStreamTextResult.text;
        this.conversationManager.addAIMessage(completeQuestionText);
      },
    });
  }

  public async orchestrateConversation(
    answerText: string,
    currentField: Conversation["collectedData"][number],
  ) {
    // First validate answerText
    const validAnswer = answerText.trim();

    if (!validAnswer) {
      throw new Error("Answer cannot be empty");
    }

    // Add answerText to transcript
    this.conversationManager.addUserMessage(validAnswer);

    // Check if we should skip validation for this field type
    const skipValidation = shouldSkipValidation(
      currentField.fieldConfiguration.inputType,
    );

    let extractedAnswer: {
      object: { isValid: boolean; answer: string | null };
    };

    if (skipValidation) {
      // For fields that should save exact value, skip validation
      extractedAnswer = {
        object: {
          isValid: true,
          answer: validAnswer,
        },
      };
    } else {
      // For fields that need validation (like text), use AI extraction
      extractedAnswer = await extractFieldAnswer({
        currentField,
        ...this.conversationManager.getConversation(),
      });
    }

    // If answer is invalid, generate followup question
    if (!extractedAnswer.object.isValid || !extractedAnswer.object.answer) {
      // Generate followup question
      const followupQuestionStreamTextResult = streamFieldQuestion({
        ...this.conversationManager.getConversation(),
        currentField,
        isFirstQuestion: false,
      });

      return followupQuestionStreamTextResult.toUIMessageStream({
        // TODO: This is not working, also tried ai sdk docs suggestion for streamText option - experimental_generateMessageId
        // https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text#experimental_generate-message-id
        generateMessageId: () => {
          return this.streamId;
        },
        onFinish: async () => {
          const completeQuestionText =
            await followupQuestionStreamTextResult.text;
          this.conversationManager.addAIMessage(completeQuestionText);
        },
      });
    }

    // If answer is valid, save it and check for next field
    this.conversationManager.saveFieldAnswer(
      currentField.id,
      extractedAnswer.object.answer,
    );
    const nextField = this.conversationManager.getNextEmptyField();

    // If next field found, generate and stream question for next field
    if (nextField) {
      const questionStreamTextResult = streamFieldQuestion({
        ...this.conversationManager.getConversation(),
        currentField: nextField,
        isFirstQuestion: true,
      });

      return questionStreamTextResult.toUIMessageStream({
        generateMessageId: () => {
          return this.streamId;
        },
        onFinish: async () => {
          const completeQuestionText = await questionStreamTextResult.text;
          this.conversationManager.addAIMessage(completeQuestionText);
        },
      });
    }

    // If no next field found, mark conversation as complete and return end message stream
    this.conversationManager.addAIMessage(this.endMessage);
    this.conversationManager.markConversationComplete();

    const endMessageStream = createUIMessageStream({
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

    return endMessageStream;
  }
}
