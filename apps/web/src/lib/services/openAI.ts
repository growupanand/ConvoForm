import OpenAI from "openai";
import {
  ChatCompletionFunctions,
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionRequest,
  OpenAIApi,
} from "openai-edge";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

import { OPEN_AI_MODEL, OPENAI_API_KEY } from "../constants";
import { SystemPromptService } from "./systemPrompt";

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

  constructor() {
    super();
  }

  getOpenAIResponse(
    messages: ChatCompletionRequestMessage[],
    stream: boolean = false,
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

  getOpenAIResponseStream(
    messages: ChatCompletionRequestMessage[],
    functions?: ChatCompletionFunctions[],
  ) {
    return this.getOpenAIResponse(messages, true, functions);
  }

  getOpenAIResponseJSON(messages: ChatCompletionMessageParam[]) {
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
