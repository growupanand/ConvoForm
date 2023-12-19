import { SystemPromptService } from "./systemPrompt";
import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai-edge";
import { OPENAI_API_KEY, OPEN_AI_MODEL } from "../constants";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { db } from "../db";
import { FormWithFields } from "../types/form";
import { FormFieldData } from "../types/conversation";

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export class ConversationService extends SystemPromptService {
  form: FormWithFields;

  constructor(form: FormWithFields) {
    super(form);
    this.form = form;
  }

  public getOpenAIResponse(
    messages: ChatCompletionRequestMessage[],
    stream: boolean = true
  ) {
    return openai.createChatCompletion({
      model: OPEN_AI_MODEL,
      stream,
      messages,
    });
  }

  public async getNextQuestion(
    messages: ChatCompletionRequestMessage[],
    stream: boolean = true
  ) {
    const systemMessage = this.getConversationFlowPromptMessage();
    const openAiResponse = await this.getOpenAIResponse([
      systemMessage,
      ...messages,
    ]);
    if (stream) {
      const stream = OpenAIStream(openAiResponse);
      return new StreamingTextResponse(stream);
    }
    return openAiResponse;
  }

  public async getFormFieldsDataFromConversation(
    messages: ChatCompletionRequestMessage[]
  ): Promise<FormFieldData> {
    const systemMessage = this.getFormFieldsDataFromConversationPromptMessage();
    try {
      const openAiResponse = await this.getOpenAIResponse(
        [systemMessage, ...messages],
        false
      );
      const openAiResponseJson = await openAiResponse.json();
      const conversationJSONString =
        openAiResponseJson.choices[0].message.content;
      return JSON.parse(conversationJSONString);
    } catch (error) {
      const errorMessage = "Unable to get form data from conversation";
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  }

  public async generateConversationName(formFieldData: FormFieldData) {
    const systemMessage =
      this.getGenerateConversationNamePromptMessage(formFieldData);
    try {
      const openAiResponse = await this.getOpenAIResponse(
        [systemMessage],
        false
      );
      const openAiResponseJson = await openAiResponse.json();
      return openAiResponseJson.choices[0].message.content;
    } catch (error) {
      const errorMessage = "Unable to generate conversation name";
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  }

  public async saveConversation(messages: ChatCompletionRequestMessage[]) {
    try {
      const formFieldsData = await this.getFormFieldsDataFromConversation(
        messages
      );
      const conversationName = await this.generateConversationName(
        formFieldsData
      );
      return await db.conversation.create({
        data: {
          name: conversationName,
          formId: this.form.id,
          formFieldsData,
          transcript: messages as Record<string, any>[],
        },
      });
    } catch (error) {
      const errorMessage = "Unable to save conversation";
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  }
}
