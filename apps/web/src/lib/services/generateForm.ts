import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

import { OpenAIService } from "./openAI";

export class GenerateFormService extends OpenAIService {
  formOverview: string;

  constructor({ formOverview }: { formOverview: string }) {
    super();
    this.formOverview = formOverview;
  }

  async getGeneratedFormData() {
    let formData = {} as Record<string, any>;
    const systemMessage = this.getGenerateFormPromptMessage({
      formOverview: this.formOverview,
    }) as ChatCompletionMessageParam;
    const message = {
      role: "user",
      content: "generate form data",
    } as ChatCompletionMessageParam;
    const openAiResponse = await this.getOpenAIResponseJSON([
      systemMessage,
      message,
    ]);

    const responseJson = openAiResponse.choices[0]?.message.content;
    if (responseJson) {
      try {
        formData = JSON.parse(responseJson);
      } catch (_) {
        formData = {};
      }
    }

    return formData;
  }
}
