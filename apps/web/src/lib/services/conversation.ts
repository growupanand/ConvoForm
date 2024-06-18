import {
  CollectedData,
  FieldHavingData,
  Transcript,
} from "@convoform/db/src/schema";
import { OpenAIStream, StreamData, StreamingTextResponse } from "ai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

import { OpenAIService } from "./openAI";

export class ConversationService extends OpenAIService {
  public getNextEmptyField(collectedData: CollectedData[]): string | undefined {
    return collectedData.find((field) => field.fieldValue === null)?.fieldName;
  }

  public async generateQuestion({
    formOverview,
    requiredFieldName,
    collectedData,
    extraCustomStreamData,
    transcript,
    onStreamFinish,
  }: {
    formOverview: string;
    requiredFieldName: string;
    collectedData: CollectedData[];
    extraCustomStreamData: Record<string, any>;
    transcript: Transcript[];
    onStreamFinish?: (completion: string) => void;
  }) {
    const fieldsWithData = collectedData.filter(
      (field) => field.fieldValue !== null,
    ) as FieldHavingData[];
    const isFirstQuestion =
      fieldsWithData.length === 0 && transcript.length === 1;

    const systemMessage = this.getGenerateQuestionPromptMessage({
      formOverview,
      requiredFieldName,
      fieldsWithData,
      isFirstQuestion,
    });
    const openAiResponse = await this.getOpenAIResponseStream([
      systemMessage,
      ...transcript.map(({ role, content }) => ({
        role,
        content,
      })),
    ]);

    // Instantiate the StreamData. This is used to send extra custom data in the response stream
    const data = new StreamData();
    data.append(extraCustomStreamData);

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(openAiResponse, {
      onFinal(completion) {
        // IMPORTANT! you must close StreamData manually or the response will never finish.
        data.close();
        onStreamFinish?.(completion);
      },
    });
    // Respond with the stream
    return new StreamingTextResponse(
      stream,
      {
        headers: { "Access-Control-Allow-Origin": "*" },
      },
      data,
    );
  }

  public async extractAnswerFromMessage({
    transcript,
    currentField,
    formOverview,
  }: {
    transcript: Transcript[];
    currentField: string;
    formOverview: string;
  }) {
    let isAnswerExtracted: boolean = false;
    let extractedAnswer: string = "";
    let reasonForFailure: string | null = null;
    let otherFieldsData: FieldHavingData[] = [];

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
    formOverview,
    fieldsWithData,
    extraCustomStreamData,
    onStreamFinish,
  }: {
    formOverview: string;
    fieldsWithData: FieldHavingData[];
    extraCustomStreamData: Record<string, any>;
    onStreamFinish?: (completion: string) => void;
  }) {
    const systemMessage = this.getGenerateEndMessagePromptMessage({
      formOverview,
      fieldsWithData,
    });

    const openAiResponse = await this.getOpenAIResponseStream([
      systemMessage,
      {
        role: "user",
        content: "End conversation",
      },
    ]);

    // Instantiate the StreamData. This is used to send extra custom data in the response stream
    const data = new StreamData();
    data.append(extraCustomStreamData);

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(openAiResponse, {
      onFinal(completion) {
        // IMPORTANT! you must close StreamData manually or the response will never finish.
        data.close();
        onStreamFinish?.(completion);
      },
    });
    // Respond with the stream
    return new StreamingTextResponse(
      stream,
      { headers: { "Access-Control-Allow-Origin": "*" } },
      data,
    );
  }

  public async generateConversationName({
    formOverview,
    fieldsWithData,
  }: {
    formOverview: string;
    fieldsWithData: FieldHavingData[];
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
