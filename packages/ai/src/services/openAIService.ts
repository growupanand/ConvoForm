import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";
import { SystemPromptService } from "./systemPromptService";

export const OPEN_AI_MODEL = process.env.OPEN_AI_MODEL ?? "gpt-4o-mini";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

// Modern OpenAI client for JSON responses
const openAiClient = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export class OpenAIService extends SystemPromptService {
  apiKey: string = OPENAI_API_KEY;
  openAIModel: string = OPEN_AI_MODEL;

  /**
   * Get JSON response using the OpenAI client directly
   */
  async getOpenAIResponseJSON(messages: ChatCompletionMessageParam[]) {
    return openAiClient.chat.completions.create({
      model: this.openAIModel,
      messages,
      response_format: {
        type: "json_object",
      },
    });
  }
}
