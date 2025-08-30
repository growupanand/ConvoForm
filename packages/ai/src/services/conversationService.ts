import { openai } from "@ai-sdk/openai";
import {
  type CollectedFilledData,
  type ExtraStreamData,
  type FormFieldResponses,
  type Transcript,
  shouldSkipValidation,
  transcriptSchema,
} from "@convoform/db/src/schema";
import { streamText } from "ai";

import { CONVERSATION_END_MESSAGE } from "@convoform/common";
import type { ChatCompletionMessageParam } from "openai/resources";
import { OpenAIService } from "./openAIService";

export class ConversationService extends OpenAIService {
  public getNextEmptyField(formFieldResponses: FormFieldResponses[]) {
    return formFieldResponses.find((field) => field.fieldValue === null);
  }

  public async generateQuestion({
    formOverview,
    currentField,
    formFieldResponses,
    extraCustomStreamData,
    transcript,
    onStreamFinish,
  }: {
    formOverview: string;
    currentField: FormFieldResponses;
    formFieldResponses: FormFieldResponses[];
    extraCustomStreamData: ExtraStreamData;
    transcript: Transcript[];
    onStreamFinish?: (completion: string) => void;
  }) {
    const fieldsWithData = formFieldResponses.filter(
      (field) => field.fieldValue !== null,
    ) as CollectedFilledData[];
    const isFirstQuestion =
      fieldsWithData.length === 0 && transcript.length === 1;

    const systemMessage = this.getGenerateQuestionPromptMessage({
      formOverview,
      currentField,
      fieldsWithData,
      isFirstQuestion,
    });
    const messages = [
      {
        role: systemMessage.role as "system",
        content: systemMessage.content || "",
      },
      ...transcript.map(({ role, content }) => ({
        role: role as "user" | "assistant" | "system",
        content,
      })),
    ];

    // Create a custom stream compatible with existing frontend parser
    const encoder = new TextEncoder();
    const modelName = this.openAIModel; // Capture model name for use in stream

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send custom data first (using format expected by frontend: "2:" prefix for data)
          const safeJsonString = JSON.stringify([extraCustomStreamData]);
          controller.enqueue(encoder.encode(`2:${safeJsonString}\n`));

          // Get streamText result
          const result = await streamText({
            model: openai(modelName),
            messages,
          });

          let fullText = "";

          // Stream text chunks (using format expected by frontend: "0:" prefix for text)
          for await (const textPart of result.textStream) {
            fullText += textPart;
            controller.enqueue(
              encoder.encode(`0:${JSON.stringify(textPart)}\n`),
            );
          }

          // Call onStreamFinish with complete text
          onStreamFinish?.(fullText);
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    // Return response with proper headers
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  /**
   * There should be at least 3 transcript messages in the conversation to extract answer,
   * 1. Initial user message e.g. "Hi", "start the form submission"
   * 2. AI assistant message e.g. "Hello! To start with, may I have your full name for the job application as a full stack engineer?"
   * 3. User message e.g. "My name is Utkarsh Anand"
   */
  public async extractAnswer({
    transcript,
    currentField,
    formOverview,
  }: {
    transcript: Transcript[];
    currentField: FormFieldResponses;
    formOverview: string;
  }) {
    let isAnswerExtracted = false;
    let extractedAnswer = "";
    let reasonForFailure: string | null = null;
    let otherFieldsData: CollectedFilledData[] = [];
    const skipValidation = shouldSkipValidation(
      currentField.fieldConfiguration.inputType,
    );

    const isValidTranscript = transcriptSchema
      .array()
      .min(3)
      .safeParse(transcript).success;
    if (!isValidTranscript) {
      throw new Error("Does not have enough transcript data to extract answer");
    }

    if (skipValidation) {
      return {
        isAnswerExtracted: true,
        // biome-ignore lint/style/noNonNullAssertion: Already checked above
        extractedAnswer: transcript[transcript.length - 1]!.content,
        reasonForFailure,
        otherFieldsData,
      };
    }

    const systemMessage = this.getExtractAnswerPromptMessage({
      transcript,
      currentField,
      formOverview,
    }) as ChatCompletionMessageParam;
    const message = {
      role: "user",
      content: "Extract answer",
    } as ChatCompletionMessageParam;
    const openAiResponse = await this.getOpenAIResponseJSON([
      systemMessage,
      message,
    ]);
    const responseJson = openAiResponse.choices[0]?.message.content;
    if (responseJson) {
      try {
        const parsedJson = JSON.parse(responseJson);
        isAnswerExtracted = parsedJson.isAnswerExtracted ?? isAnswerExtracted;
        extractedAnswer = parsedJson.extractedAnswer ?? extractedAnswer;
        reasonForFailure = parsedJson.reasonForFailure ?? reasonForFailure;
        otherFieldsData = Array.isArray(parsedJson.otherFieldsData)
          ? parsedJson.otherFieldsData
          : otherFieldsData;
      } catch (_) {
        /* empty */
      }
    }

    return {
      isAnswerExtracted,
      extractedAnswer,
      reasonForFailure,
      otherFieldsData,
    };
  }

  public async generateEndMessage({
    extraCustomStreamData,
  }: {
    extraCustomStreamData: Record<string, any>;
    onStreamFinish?: (completion: string) => void;
  }) {
    const endMessage = CONVERSATION_END_MESSAGE;
    const encoder = new TextEncoder();

    // Create a custom stream compatible with existing frontend parser
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send custom data first (using format expected by frontend: "2:" prefix for data)
          const safeJsonString = JSON.stringify([extraCustomStreamData]);
          controller.enqueue(encoder.encode(`2:${safeJsonString}\n`));

          // Send the end message as text (using format expected by frontend: "0:" prefix for text)
          controller.enqueue(
            encoder.encode(`0:${JSON.stringify(endMessage)}\n`),
          );
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    // Return response with proper headers
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  public async generateConversationName({
    formOverview,
    fieldsWithData,
  }: {
    formOverview: string;
    fieldsWithData: CollectedFilledData[];
  }) {
    const systemMessage = this.getGenerateConversationNamePromptMessage({
      formOverview,
      fieldsWithData,
    }) as ChatCompletionMessageParam;

    const openAiResponse = await this.getOpenAIResponseJSON([
      systemMessage,
      {
        role: "user",
        content: "Generate conversation name",
      },
    ]);

    let conversationName = "Finished conversation";

    const responseJson = openAiResponse.choices[0]?.message.content;
    if (responseJson) {
      try {
        const parsedJson = JSON.parse(responseJson);
        conversationName = parsedJson.conversationName ?? conversationName;
      } catch (_) {
        /* empty */
      }
    }

    return { conversationName };
  }
}
