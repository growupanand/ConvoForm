import { Conversation } from "@convoform/db";
import {
  CreateMessage,
  experimental_StreamData,
  FunctionCallPayload,
  JSONValue,
  OpenAIStream,
  StreamingTextResponse,
} from "ai";
import { ChatCompletionRequestMessage } from "openai-edge";

import { api } from "@/trpc/server";
import { FormWithFields } from "../types/form";
import { OpenAIService } from "./openAI";

export class ConversationService extends OpenAIService {
  form: FormWithFields;
  isPreview: boolean;

  constructor(form: FormWithFields, isPreview?: boolean) {
    super();
    this.form = form;
    this.isPreview = isPreview || false;
  }

  async getNextQuestion(messages: ChatCompletionRequestMessage[]) {
    const systemMessage = this.getConversationFlowPromptMessage(this.form);
    const openAiResponse = await this.getOpenAIResponseStream([
      systemMessage,
      ...messages,
    ]);

    // We are using experimental_StreamData to send extra custom data in response stream
    const data = new experimental_StreamData();

    const stream = OpenAIStream(openAiResponse, {
      experimental_onFunctionCall: (
        functionCallPayload: FunctionCallPayload,
        createFunctionCallMessages: (
          functionCallResult: JSONValue,
        ) => CreateMessage[],
      ) =>
        this.handleFunctionCalling(
          functionCallPayload,
          createFunctionCallMessages,
          messages,
          data,
        ),
      onFinal() {
        // IMPORTANT! you must close StreamData manually or the response will never finish.
        data.close();
      },
      experimental_streamData: true,
    });
    return new StreamingTextResponse(stream, {}, data);
  }

  async handleFunctionCalling(
    functionCallPayload: FunctionCallPayload,
    createFunctionCallMessages: (
      functionCallResult: JSONValue,
    ) => CreateMessage[],
    messages: ChatCompletionRequestMessage[],
    data: experimental_StreamData,
  ) {
    // Check if function called to save form data
    if (functionCallPayload.name === "saveConversationFormData") {
      const thankYouMessage =
        (functionCallPayload.arguments.thankYouMessage as string) ||
        "Thank you for filling the form.";

      // Check if conversation is in preview mode, we don't want to save data in preview mode
      if (this.isPreview) {
        data.append("conversationFinished");
        return thankYouMessage;
      }

      // To save conversation in database we need three things:
      //    1. Form field data
      //    2. Conversation transcript
      //    3. Conversation name

      // 1. Get form field data
      let formFieldData = {} as Record<string, string>;
      const formFieldDataJSONString = functionCallPayload.arguments
        .formData as string;
      try {
        formFieldData = JSON.parse(formFieldDataJSONString);
      } catch (error) {
        console.error("Unable to parse form field data", {
          formFieldDataJSONString,
        });
      }

      // 2. Get conversation transcript
      const transcript = [
        ...messages,
        {
          role: "assistant",
          content: thankYouMessage,
        },
      ] as Record<string, string>[];

      // 3. Get conversation name
      const conversationName =
        typeof functionCallPayload.arguments.conversationName === "string"
          ? functionCallPayload.arguments.conversationName
          : "Conversation";

      // Save conversation in database
      try {
        await this.saveConversation(
          formFieldData,
          conversationName,
          transcript,
        );

        // Append conversationFinished in stream data, so that in client we can show end screen
        data.append("conversationFinished");

        // Return success message
        return thankYouMessage;
      } catch (error) {
        const newMessage = createFunctionCallMessages(
          "unable to save conversation",
        ) as ChatCompletionRequestMessage[];
        return await this.getNextQuestion([...messages, ...newMessage]);
      }
    }
    const newMessage = createFunctionCallMessages(
      "I don't have function which you are calling",
    ) as ChatCompletionRequestMessage[];
    return await this.getNextQuestion([...messages, ...newMessage]);
  }

  async saveConversation(
    formFieldsData: Record<string, string>,
    conversationName: string,
    transcript: Record<string, string>[],
  ): Promise<Conversation> {
    try {
      const newConversation = {
        formId: this.form.id,
        organizationId: this.form.organizationId,
        name: conversationName,
        formFieldsData,
        transcript,
        formOverview: this.form.overview,
        fieldsData: [],
      };
      return await api.conversation.create(newConversation);
    } catch (error) {
      const errorMessage = "Unable to save conversation";
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  }

  getOpenAIFunctions() {
    return [
      {
        name: "saveConversationFormData",
        description: "This function can save form data in to database",
        parameters: {
          type: "object",
          properties: {
            formData: {
              type: "string",
              description:
                "You will create a JSON string from form data submitted by user, in this json key will be field name and value will be field value",
            },
            conversationName: {
              type: "string",
              description:
                "You will generate one word name from data collected from user, E.g. user name or email address etc",
            },
            thankYouMessage: {
              type: "string",
              description: "Short thank you message for user",
            },
          },
          required: ["formData", "conversationName", "thankYouMessage"],
        },
      },
    ];
  }
}
