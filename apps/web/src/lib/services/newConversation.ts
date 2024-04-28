import { FieldData } from "@convoform/db";
import { OpenAIStream, StreamData, StreamingTextResponse } from "ai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

import { Message } from "../validations/form";
import { OpenAIService } from "./openAI";

export class NewConversationService extends OpenAIService {
  public getNextEmptyField(fieldsData: FieldData[]): string | undefined {
    return fieldsData.find((field) => field.fieldValue === null)?.fieldName;
  }

  public async generateQuestion({
    formOverview,
    requiredFieldName,
    fieldsData,
    extraStreamData,
    messages,
    onFinal,
  }: {
    formOverview: string;
    requiredFieldName: string;
    fieldsData: FieldData[];
    extraStreamData: Record<string, any>;
    messages: Message[];
    onFinal?: (completion: string) => void;
  }) {
    const fieldsDataWithValues = fieldsData.filter(
      (field) => field.fieldValue !== null,
    ) as Array<Omit<FieldData, "fieldValue"> & { fieldValue: string }>;
    const isFirstQuestion =
      fieldsDataWithValues.length === 0 && messages.length === 1;

    const systemMessage = this.getGenerateQuestionPromptMessage(
      formOverview,
      requiredFieldName,
      fieldsDataWithValues,
      isFirstQuestion,
    );
    const openAiResponse = await this.getOpenAIResponseStream([
      systemMessage,
      ...messages.map(({ role, content }) => ({
        role,
        content,
      })),
    ]);

    // Instantiate the StreamData. This is used to send extra custom data in the response stream
    const data = new StreamData();
    data.append(extraStreamData);

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(openAiResponse, {
      onFinal(completion) {
        // IMPORTANT! you must close StreamData manually or the response will never finish.
        data.close();
        onFinal?.(completion);
      },
    });
    // Respond with the stream
    return new StreamingTextResponse(stream, {}, data);
  }

  public async extractAnswerFromMessage({
    messages,
    currentField,
    formOverview,
  }: {
    messages: Message[];
    currentField: string;
    formOverview: string;
  }) {
    let isAnswerExtracted = false;
    let extractedAnswer = "";

    const systemMessage = this.getExtractAnswerPromptMessage({
      messages,
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
      } catch (_) {
        /* empty */
      }
    }

    return { isAnswerExtracted, extractedAnswer };
  }

  public async generateEndMessage({
    formOverview,
    fieldsData,
    extraStreamData,
    onFinal,
  }: {
    formOverview: string;
    fieldsData: Array<Omit<FieldData, "fieldValue"> & { fieldValue: string }>;
    extraStreamData: Record<string, any>;
    onFinal?: (completion: string) => void;
  }) {
    const systemMessage = this.getGenerateEndMessagePromptMessage(
      formOverview,
      fieldsData,
    );

    const openAiResponse = await this.getOpenAIResponseStream([
      systemMessage,
      {
        role: "user",
        content: "End conversation",
      },
    ]);

    // Instantiate the StreamData. This is used to send extra custom data in the response stream
    const data = new StreamData();
    data.append(extraStreamData);

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(openAiResponse, {
      onFinal(completion) {
        // IMPORTANT! you must close StreamData manually or the response will never finish.
        data.close();
        onFinal?.(completion);
      },
    });
    // Respond with the stream
    return new StreamingTextResponse(stream, {}, data);
  }
}
