import { ChatCompletionRequestMessage } from "openai-edge";
import { FormField, formFieldSchema } from "../validations/form";
import { z } from "zod";

export const formSchemaSystemPrompt = z.object({
  overview: z.string().min(1).max(255),
  aboutCompany: z.string().min(1).max(255),
  formField: z.array(formFieldSchema).min(1),
});

export type FormSchemaSystemPrompt = z.infer<typeof formSchemaSystemPrompt>;

export class SystemPromptService {
  constructor() {}

  getFormFieldNames(form: { formField: FormField[] }) {
    return form.formField.map((item) => item.fieldName);
  }

  getConversationFlowPrompt(form: FormSchemaSystemPrompt) {
    return `
        This platform lets users complete forms through conversational flow. Your task is to create a conversation path based on the provided form information and fields.
        Please note that a form field name might consist of multiple words, separated by spaces.
        
        Please adhere to the following rules while creating a conversational flow:

        RULES:
            - Only pose questions pertaining to the provided form fields.
            - Validate each user-provided form field value. If a value appears invalid, ask for user confirmation.
            - Keep each question concise and clear – not exceeding 25 words – as users can view only one line at a time.
            - If all fields have been answered correctly, save the form data directly into the database without further questions.
            - Avoid saving any data after it has been stored.

        Here is some context about the form and the company responsible for its creation, followed by the form fields:

        Form Details: ${form.overview}

        About the Company: ${form.aboutCompany}

        Form Fields:
            ${this.getFormFieldNames(form).join("\n")}

        `;
  }

  getConversationFlowPromptMessage(form: FormSchemaSystemPrompt) {
    return {
      role: "system",
      content: this.getConversationFlowPrompt(form),
    } as ChatCompletionRequestMessage;
  }

  getGenerateFormFieldPrompt(form: FormSchemaSystemPrompt) {
    return `
        This platform lets users complete forms through conversational flow. Your task is to create one form field based on the provided form information and fields.
        
        Here is some context about the form and the company responsible for its creation, followed by the form fields:

        Form Details: ${form.overview}

        About the Company: ${form.aboutCompany}

        Form Fields:
            ${this.getFormFieldNames(form).join("\n")}

        
        OUTPUT FORMAT JSON:
        {
          filedName: "field name",
        }

        `;
  }

  getGenerateFormFieldPromptMessage(form: FormSchemaSystemPrompt) {
    return {
      role: "system",
      content: this.getGenerateFormFieldPrompt(form),
    } as ChatCompletionRequestMessage;
  }
}
