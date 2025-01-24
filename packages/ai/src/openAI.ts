import OpenAI from "openai";
import {
  type ChatCompletionFunctions,
  type ChatCompletionRequestMessage,
  Configuration,
  type CreateChatCompletionRequest,
  OpenAIApi,
} from "openai-edge";

import type { ChatCompletionMessageParam } from "openai/resources";
import { SystemPromptService } from "./systemPrompt";

export const OPEN_AI_MODEL = process.env.OPEN_AI_MODEL ?? "gpt-3.5-turbo-1106";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

const openAI = new OpenAIApi(
  new Configuration({
    apiKey: OPENAI_API_KEY,
  }),
);

const openAiOG = new OpenAI({
  apiKey: OPENAI_API_KEY, // This is the default and can be omitted
});

export class OpenAIService extends SystemPromptService {
  apiKey: string = OPENAI_API_KEY;
  openai: OpenAIApi = openAI;
  openAIModel: string = OPEN_AI_MODEL;

  async getOpenAIResponse(
    messages: ChatCompletionRequestMessage[],
    stream = false,
    functions?: ChatCompletionFunctions[],
  ) {
    const createChatCompletionRequest = {
      model: this.openAIModel,
      stream,
      messages,
    } as CreateChatCompletionRequest;
    const openAIFunctions = functions ?? this.getOpenAIFunctions();
    if (openAIFunctions.length > 0) {
      createChatCompletionRequest.functions = openAIFunctions;
      createChatCompletionRequest.function_call = "auto";
    }
    return this.openai.createChatCompletion(createChatCompletionRequest);
  }

  async getOpenAIResponseStream(
    messages: ChatCompletionRequestMessage[],
    functions?: ChatCompletionFunctions[],
  ) {
    return this.getOpenAIResponse(messages, true, functions);
  }

  async getOpenAIResponseJSON(messages: ChatCompletionMessageParam[]) {
    return openAiOG.chat.completions.create({
      model: this.openAIModel,
      messages,
      response_format: {
        type: "json_object",
      },
    });
  }

  /**
   * Used to define OpenAI functions for calling in the chat.
   * [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
   *
   * @returns Array of OpenAI functions
   */
  getOpenAIFunctions(): ChatCompletionFunctions[] {
    return [];
  }
}
