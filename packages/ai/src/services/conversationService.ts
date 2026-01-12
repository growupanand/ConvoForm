import type { CoreConversation } from "@convoform/db/src/schema";
import { shouldSkipValidation } from "@convoform/db/src/schema/formFields/utils";
import { type ILogger, createConversationLogger } from "@convoform/logger";
import type { EdgeTracer } from "@convoform/tracing";
import {
  type AsyncIterableStream,
  type InferUIMessageChunk,
  type UIMessage,
  createUIMessageStream,
} from "ai";
import { extractFieldAnswer } from "../ai-actions/extractFieldAnswer";
import { generateConversationName } from "../ai-actions/generateConversationName";
import { streamFieldQuestion } from "../ai-actions/streamFieldQuestion";
import type { ConversationManager } from "../managers/conversationManager";
import { extractFieldInputType } from "../utils";
import type { ConversationAIMetadata } from "../utils/llmAnalyticsUtils";

export type ConversationServiceUIMessage = UIMessage<
  never, // metadata type
  {
    conversation?: CoreConversation;
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
  private logger: ILogger;
  private tracer?: EdgeTracer;

  constructor(
    conversationManager: ConversationManager,
    streamId: string,
    tracer?: EdgeTracer,
  ) {
    this.conversationManager = conversationManager;
    this.streamId = streamId;
    this.tracer = tracer;

    const conversation = conversationManager.getConversation();

    // Create logger with conversation context
    this.logger = createConversationLogger({
      conversationId: conversation.id,
      formId: conversation.form.id,
      organizationId: conversation.organizationId,
    });

    const customEndScreenMessage = conversation.form.customEndScreenMessage;
    if (customEndScreenMessage) {
      this.endMessage = customEndScreenMessage;
    }
  }

  /**
   * Get analytics metadata from current conversation
   */
  private getAnalyticsMetadata(): ConversationAIMetadata {
    const conversation = this.conversationManager.getConversation();
    return {
      formId: conversation.form.id,
      conversationId: conversation.id,
      organizationId: conversation.organizationId,
      // Conversations are anonymous (no userId), only organization-level tracking
      userId: undefined,
    };
  }

  public async initialize(): Promise<
    AsyncIterableStream<InferUIMessageChunk<ConversationServiceUIMessage>>
  > {
    // First check if conversation is already initialized
    if (this.conversationManager.getConversation().transcript.length > 0) {
      this.logger.error("Conversation already initialized");
      throw new Error("Conversation already initialized");
    }

    const firstEmptyField = this.conversationManager.getNextEmptyField();
    if (!firstEmptyField) {
      this.logger.error("No empty field exists for initialization");
      throw new Error(
        "Unable to generate initial conversation stream, there is no empty field exists.",
      );
    }
    return await this.generateFieldQuestionStream(firstEmptyField, true);
  }

  /**
   * Orchestrates the conversation flow based on user answer
   */
  public async process(
    answerText: string,
    currentFieldId: CoreConversation["formFieldResponses"][number]["id"],
  ): Promise<
    AsyncIterableStream<InferUIMessageChunk<ConversationServiceUIMessage>>
  > {
    if (this.conversationManager.checkConversationIsComplete()) {
      this.logger.error(
        "Attempted to process answer on completed conversation",
      );
      throw new Error("Conversation is already complete");
    }

    let validatedAnswer: {
      object: { isValid: boolean; answer: string | null };
    };

    const sanitizedAnswerText = answerText.trim();

    if (!sanitizedAnswerText) {
      this.logger.warn("Empty answer text provided");
      throw new Error("Answer cannot be empty");
    }

    const currentField = this.conversationManager.getFieldById(currentFieldId);
    if (!currentField) {
      this.logger.error("Current field not found", { fieldId: currentFieldId });
      throw new Error("Current field not found");
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
        metadata: {
          ...this.getAnalyticsMetadata(),
          fieldType: extractFieldInputType(currentField) as any,
        },
        tracer: this.tracer,
      });
    }

    // 1. Invalid answer: Generate and stream followup question
    if (!validatedAnswer.object.isValid || !validatedAnswer.object.answer) {
      return await this.generateFollowupQuestionStream(currentField);
    }

    // 2. Valid answer and next field exists: Save answer and generate and stream question for next field
    await this.conversationManager.saveFieldAnswer(
      currentField.id,
      validatedAnswer.object.answer,
    );

    const nextField = this.conversationManager.getNextEmptyField();

    if (nextField) {
      return await this.generateFieldQuestionStream(nextField);
    }

    // 3. Valid answer and no next field: Save answer, mark conversation as complete
    await this.conversationManager.addAIMessage(this.endMessage);

    await this.conversationManager.markConversationComplete();

    await this.generateAndUpdateConversationName();

    return await this.generateEndConversationStream();
  }

  /**
   * Generates a followup question for invalid answers
   */
  private async generateFollowupQuestionStream(
    currentField: CoreConversation["formFieldResponses"][number],
  ): Promise<
    AsyncIterableStream<InferUIMessageChunk<ConversationServiceUIMessage>>
  > {
    const streamTextResult = streamFieldQuestion(
      {
        ...this.conversationManager.getConversation(),
        currentField,
        isFirstQuestion: false,
        metadata: {
          ...this.getAnalyticsMetadata(),
          fieldType: extractFieldInputType(currentField),
        },
        tracer: this.tracer,
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
  private async generateFieldQuestionStream(
    nextField: CoreConversation["formFieldResponses"][number],
    isFirstQuestion = true,
  ): Promise<
    AsyncIterableStream<InferUIMessageChunk<ConversationServiceUIMessage>>
  > {
    await this.conversationManager.updateCurrentFieldId(nextField.id);

    const streamTextResult = streamFieldQuestion(
      {
        ...this.conversationManager.getConversation(),
        currentField: nextField,
        isFirstQuestion,
        metadata: {
          ...this.getAnalyticsMetadata(),
          fieldType: extractFieldInputType(nextField) as any,
        },
        tracer: this.tracer,
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
  private async generateEndConversationStream(): Promise<
    AsyncIterableStream<InferUIMessageChunk<ConversationServiceUIMessage>>
  > {
    // Create fake end message stream
    const fakeEndMessageStream =
      createUIMessageStream<ConversationServiceUIMessage>({
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

    return fakeEndMessageStream as AsyncIterableStream<
      InferUIMessageChunk<ConversationServiceUIMessage>
    >;
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

  public async generateAndUpdateConversationName() {
    const conversation = this.conversationManager.getConversation();

    try {
      const result = await generateConversationName({
        formOverview: conversation.form.overview,
        transcript: conversation.transcript,
        formFieldResponses: conversation.formFieldResponses,
        metadata: this.getAnalyticsMetadata(),
        tracer: this.tracer,
      });

      await this.conversationManager.updateConversationName(result.object.name);
    } catch (error) {
      this.logger.error("generateConversationName failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw error to avoid breaking conversation completion flow
    }
  }
}
