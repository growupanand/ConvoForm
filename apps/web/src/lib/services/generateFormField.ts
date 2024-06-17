import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

import { OpenAIService } from "./openAI";
import { SchemaSystemPrompt } from "./systemPrompt";

export class GenerateFormFieldService extends OpenAIService {
  form: SchemaSystemPrompt;

  constructor(form: SchemaSystemPrompt) {
    super();
    this.form = form;
  }

  async getNextFormField() {
    let nextFieldName = "";

    const systemMessage = this.getGenerateFormFieldPromptMessage(
      this.form,
    ) as ChatCompletionMessageParam;
    const message = {
      role: "user",
      content: "suggest me field name",
    } as ChatCompletionMessageParam;
    const openAiResponse = await this.getOpenAIResponseJSON([
      systemMessage,
      message,
    ]);

    const responseJson = openAiResponse.choices[0]?.message.content;
    if (responseJson) {
      try {
        nextFieldName = JSON.parse(responseJson).fieldName;
      } catch (_) {
        nextFieldName = "";
      }
    }

    return nextFieldName;
  }
}
