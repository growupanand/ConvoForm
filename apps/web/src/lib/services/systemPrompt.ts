import { FieldData } from "@convoform/db";
import { ChatCompletionRequestMessage } from "openai-edge";
import { z } from "zod";

import {
  FormField,
  formFieldSchema,
  generateFormSchema,
  Message,
} from "../validations/form";

export const formSchemaSystemPrompt = z.object({
  overview: z.string().min(100).max(500),
  formFields: z.array(formFieldSchema).min(1),
});

export type FormSchemaSystemPrompt = z.infer<typeof formSchemaSystemPrompt>;

export const getGenerateFormPromptSchema = generateFormSchema;
export class SystemPromptService {
  constructor() {}

  getFormFieldNames(form: { formFields: FormField[] }) {
    return form.formFields.map((item) => item.fieldName);
  }

  getConversationFlowPrompt(form: FormSchemaSystemPrompt) {
    return `
        This platform lets users complete forms through conversational flow. Your task is to create a conversation path based on the provided form information and fields.
        You will act like professional human, and user not feel like they are talking to a robot.
        Please note that a form field name might consist of multiple words, separated by spaces.
        
        Please adhere to the following rules while creating a conversational flow:

        RULES:
            - Only pose questions pertaining to the provided form fields.
            - Validate each user-provided form field value. If a value appears invalid, ask for user confirmation.
            - Keep each question concise and clear – not exceeding 25 words – as users can view only one line at a time.
            - If all fields have been answered correctly, save the form data directly into the database without further questions.
            - Avoid saving any data after it has been stored.
            - Start first question with greeting message. Do not ask for confirmation from user to start form filling.

        Here is some context about the form responsible for its creation, followed by the form fields:

        Form Details: ${form.overview}

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
        
        Here is some context about the form responsible for its creation, followed by the form fields:

        Form Details: ${form.overview}

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

  getGenerateFormPrompt(data: z.infer<typeof getGenerateFormPromptSchema>) {
    return `
    This automated platform allows users to design and generate forms. The tasks depend on an overview provided by the user. Validation of the form contents is crucial: if the form overview seems invalid (e.g., if it appears to be random text, or unrelated to the form being created), the form generation process should not proceed, and the "isInvalidFormOverview" value should be set to true.        
    
    Here is some context about the form overview which user provided,
    
    Form Overview: "${data.formOverview}"

    Based on the above form overview, you need to generate below data, If form overview is invalid, then don't go ahead with form generation and set "isInvalidFormOverview" to true.:


    "isInvalidFormOverview" - This checks the validity of the form overview. If it appears to be random or unrelated text, this Boolean value should be set to true.
      OUTPUT FORMAT - BOOLEAN

    "formFields" - You will generate the required form fields, these fields will display as an input box in the form, while generating form fields follow the below rules strictly:
    - You cannot generate more than five fields.
    - You cannot generate any field which answer cannot be given in text input
    - You cannot generate any string which is more than 255 characters

      OUTPUT FORMAT - JSON:
      {
        fieldName: "input label",
        placeholder: "placeholder text"
      }

    "welcomeScreenData" - This data will be used to display on the first page of the form which the user will see before starting to fill the form.

      OUTPUT FORMAT - JSON:
          {
            pageTitle: "Title of the page",
            pageDescription: "Description is like subtitle of the form which will be shown below the title of the page in smaller text",
            buttonLabelText: "Text which will display inside the button, when user will click this button he will be redirect to next page where he will see form inputs."
          }

    "formName" - This name will be used to save the form in database. User will see this name in the list of forms.

    OUTPUT FORMAT - STRING

    "formSummary" - This is summary of the form which will be shown to user before starting to fill the form.

    OUTPUT FORMAT - STRING


    
    ========================================

    FINAL OUTPUT FORMAT JSON:
      {
        formFields : JSON,
        welcomeScreenData : JSON,
        formName : STRING,
        isInvalidFormOverview : BOOLEAN,
        formSummary : STRING
      }
  `;
  }

  getGenerateFormPromptMessage(
    data: z.infer<typeof getGenerateFormPromptSchema>,
  ) {
    return {
      role: "system",
      content: this.getGenerateFormPrompt(data),
    } as ChatCompletionRequestMessage;
  }

  getGenerateQuestionPrompt(
    formOverview: string,
    requiredFieldName: string,
    fieldsDataWithValues: Array<
      Omit<FieldData, "fieldValue"> & { fieldValue: string }
    >,
    isFirstQuestion: boolean,
  ) {
    return `
        This platform lets users complete forms through conversational flow. Your task is to conversation with user to get current field data.
        And You will act like professional human, and user should not feel like they are talking to a robot.
        And Please note that a form field name might consist of multiple words, separated by spaces.
        
        Please adhere to the following rules while creating a conversational flow:

        RULES:
            - Enforce user to provide data for current field. If user deny to provide data, then keep asking for data until user provide data.
            - Only pose questions pertaining to the provided form fields.
            - Validate field value. If a value appears invalid according to field name, ask for user confirmation.
            - Keep question concise and clear – not exceeding 25 words – as users can view only one line at a time.
            ${isFirstQuestion ? "- This is first question, So ask question with greeting message. Do not ask for confirmation from user to start form filling." : ""}
            

        Here is some context about the form responsible for its creation, followed by the form fields and already provided fields data:

        Form Details: ${formOverview}

        Current Field: ${requiredFieldName}

        Already Provided Fields Data:
            ${fieldsDataWithValues
              .map((item) => `${item.fieldName}: ${item.fieldValue}`)
              .join("\n")}


        `;
  }

  getGenerateQuestionPromptMessage(
    formOverview: string,
    requiredFieldName: string,
    fieldsDataWithValues: Array<
      Omit<FieldData, "fieldValue"> & { fieldValue: string }
    >,
    isFirstQuestion: boolean,
  ) {
    return {
      role: "system",
      content: this.getGenerateQuestionPrompt(
        formOverview,
        requiredFieldName,
        fieldsDataWithValues,
        isFirstQuestion,
      ),
    } as ChatCompletionRequestMessage;
  }

  getExtractAnswerPrompt({
    messages,
    currentField,
    formOverview,
  }: {
    messages: Message[];
    currentField: string;
    formOverview: string;
  }) {
    return `
        This platform lets users complete forms through conversational flow. Your task is to extract answer for the current field based on the provided form information and conversation messages.
        Please note that a form field name might consist of multiple words, separated by spaces.
        

        Form Details: ${formOverview}

        Current Field: ${currentField}

        Conversation Messages:
            ${messages.map((message) => `${message.role}: ${message.content}`).join("\n")}


        ========================================

        FINAL OUTPUT FORMAT JSON:
          {
            isAnswerExtracted : BOOLEAN,
            extractedAnswer : STRING,
          }


        `;
  }

  getExtractAnswerPromptMessage({
    messages,
    currentField,
    formOverview,
  }: {
    messages: Message[];
    currentField: string;
    formOverview: string;
  }) {
    return {
      role: "system",
      content: this.getExtractAnswerPrompt({
        messages,
        currentField,
        formOverview,
      }),
    } as ChatCompletionRequestMessage;
  }

  getGenerateEndMessagePrompt(
    formOverview: string,
    fieldsDataWithValues: Array<
      Omit<FieldData, "fieldValue"> & { fieldValue: string }
    >,
  ) {
    return `
        This platform lets users complete forms through conversational flow. User have provided all the required data for the form.
        Your task is to generate end message for the user based on the provided form information and fields.
        And You will act like professional human, and user should not feel like they are talking to a robot.


        Here is some context about the form responsible for its creation, followed by already provided fields data:

        Form Details: ${formOverview}

        Already Provided Fields Data:
            ${fieldsDataWithValues
              .map((item) => `${item.fieldName}: ${item.fieldValue}`)
              .join("\n")}


        `;
  }

  getGenerateEndMessagePromptMessage(
    formOverview: string,
    fieldsDataWithValues: Array<
      Omit<FieldData, "fieldValue"> & { fieldValue: string }
    >,
  ) {
    return {
      role: "system",
      content: this.getGenerateEndMessagePrompt(
        formOverview,
        fieldsDataWithValues,
      ),
    } as ChatCompletionRequestMessage;
  }
}
