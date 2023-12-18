import { SystemPromptService } from "./systemPrompt";
import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai-edge";
import { OPENAI_API_KEY, OPEN_AI_MODEL } from "../constants";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { db } from "../db";
import { ConversationForm } from "../types/form";

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export class ConversationService extends SystemPromptService {
  form: ConversationForm;

  constructor(form: ConversationForm) {
    super(form);
    this.form = form;
  }

  public async getNextQuestion(
    messages: ChatCompletionRequestMessage[],
    stream: boolean = true
  ) {
    const systemMessage = this.getConversationFlowPromptMessage();
    const openAiResponse = await openai.createChatCompletion({
      model: OPEN_AI_MODEL,
      stream,
      messages: [systemMessage, ...messages],
    });
    if (stream) {
      const stream = OpenAIStream(openAiResponse);
      return new StreamingTextResponse(stream);
    }
    return openAiResponse;
  }

  public async getFormFieldsDataFromConversation(
    messages: ChatCompletionRequestMessage[]
  ): Promise<Record<string, string>> {
    const systemMessage = this.getConversationJSONPromptMessage();
    try {
      const openAiResponse = await openai.createChatCompletion({
        model: OPEN_AI_MODEL,
        stream: false,
        messages: [systemMessage, ...messages],
      });
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

  public async saveConversation(messages: ChatCompletionRequestMessage[]) {
    const formFieldsData = await this.getFormFieldsDataFromConversation(
      messages
    );
    return await db.conversation.create({
      data: {
        formId: this.form.id,
        formFieldsData,
        transcript: messages as Record<string, any>[],
      },
    });
  }
}
