import {
  ChatCompletionFunctions,
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionRequest,
  OpenAIApi,
} from "openai-edge";
import { FormWithFields } from "../types/form";
import { SystemPromptService } from "./systemPrompt";
import { OPENAI_API_KEY, OPEN_AI_MODEL } from "../constants";

const openAI = new OpenAIApi(
  new Configuration({
    apiKey: OPENAI_API_KEY,
  })
);

export class OpenAIService extends SystemPromptService {
  form: FormWithFields;
  apiKey: string = OPENAI_API_KEY;
  openai: OpenAIApi = openAI;
  openAIModel: string = OPEN_AI_MODEL;

  constructor(form: FormWithFields) {
    super(form);
    this.form = form;
  }

  getOpenAIResponse(
    messages: ChatCompletionRequestMessage[],
    stream: boolean = false,
    functions?: ChatCompletionFunctions[]
  ) {
    const createChatCompletionRequest = {
      model: this.openAIModel,
      stream,
      messages,
    } as CreateChatCompletionRequest;
    if (functions) {
      createChatCompletionRequest.functions = functions;
      createChatCompletionRequest.function_call = "auto";
    }
    return this.openai.createChatCompletion(createChatCompletionRequest);
  }

  getOpenAIResponseStream(
    messages: ChatCompletionRequestMessage[],
    functions?: ChatCompletionFunctions[]
  ) {
    return this.getOpenAIResponse(messages, true, functions);
  }
}
