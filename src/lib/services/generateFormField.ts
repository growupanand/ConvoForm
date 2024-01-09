import { NextResponse } from "next/server";
import { OpenAIService } from "./openAI";
import { FormSchemaSystemPrompt } from "./systemPrompt";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export class GenerateFormFieldService extends OpenAIService {
  form: FormSchemaSystemPrompt;

  constructor(form: FormSchemaSystemPrompt) {
    super();
    this.form = form;
  }

  async getNextFormField() {
    let nextFieldName = "";

    const systemMessage = this.getGenerateFormFieldPromptMessage(
      this.form
    ) as ChatCompletionMessageParam;
    const message = {
      role: "user",
      content: "suggest me field name",
    } as ChatCompletionMessageParam;
    const openAiResponse = await this.getOpenAIResponseJSON([
      systemMessage,
      message,
    ]);

    const responseJson = openAiResponse.choices[0].message.content;
    if (responseJson) {
      try {
        nextFieldName = JSON.parse(responseJson).fieldName;
      } catch (_) {
        nextFieldName = "";
      }
    }

    return NextResponse.json({
      fieldName: nextFieldName,
    });
  }
}
