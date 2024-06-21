import {
  CollectedData,
  FieldHavingData,
  generateFormSchema,
  selectFormFieldSchema,
  selectFormSchema,
  Transcript,
} from "@convoform/db/src/schema";
import { ChatCompletionRequestMessage } from "openai-edge";
import { z } from "zod";

const promtFormFieldSchema = selectFormFieldSchema.omit({
  createdAt: true,
  updatedAt: true,
});

type PromtFormFieldSchema = z.infer<typeof promtFormFieldSchema>;

export const systemPromptSchema = selectFormSchema
  .pick({ overview: true })
  .extend({
    formFields: promtFormFieldSchema.array().min(1),
  });

export type SchemaSystemPrompt = z.infer<typeof systemPromptSchema>;

export class SystemPromptService {
  getFormFieldNames(form: { formFields: PromtFormFieldSchema[] }) {
    return form.formFields.map((item) => item.fieldName);
  }

  getGenerateFormFieldPrompt(form: SchemaSystemPrompt) {
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

  getGenerateFormFieldPromptMessage(form: SchemaSystemPrompt) {
    return {
      role: "system",
      content: this.getGenerateFormFieldPrompt(form),
    } as ChatCompletionRequestMessage;
  }

  getGenerateFormPrompt(data: z.infer<typeof generateFormSchema>) {
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
        placeholder: "placeholder text",
        fieldDescription: "description of the field used for generating question for the field"
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

  getGenerateFormPromptMessage(data: z.infer<typeof generateFormSchema>) {
    return {
      role: "system",
      content: this.getGenerateFormPrompt(data),
    } as ChatCompletionRequestMessage;
  }

  getGenerateQuestionPromptMessage({
    formOverview,
    currentField,
    fieldsWithData,
    isFirstQuestion,
  }: {
    formOverview: string;
    currentField: CollectedData;
    fieldsWithData: FieldHavingData[];
    isFirstQuestion: boolean;
  }) {
    const systemPrompt = `
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

    Already Collected Fields Data:
    ${fieldsWithData
      .map((item) => `${item.fieldName}: ${item.fieldValue}`)
      .join("\n")}

    Current Field Name: ${currentField.fieldName}
    Current Field description: ${currentField.fieldDescription}
    `;

    return {
      role: "system",
      content: systemPrompt,
    } as ChatCompletionRequestMessage;
  }

  getExtractAnswerPromptMessage({
    transcript,
    currentField,
    formOverview,
  }: {
    transcript: Transcript[];
    currentField: CollectedData;
    formOverview: string;
  }) {
    const systemPrompt = `
    This platform lets users complete forms through conversational flow. Your task is to extract answer for the current field based on the provided form information and conversation messages.
    Please note that a form field name might consist of multiple words, separated by spaces.
    

    Form Details: ${formOverview}

    Current Field Name: ${currentField.fieldName}
    Current Field Description: ${currentField.fieldDescription}

    Conversation Messages:
        ${transcript.map((message) => `${message.role}: ${message.content}`).join("\n")}


    ========================================

    FINAL OUTPUT FORMAT JSON:
      {
        // If answer is extracted successfully for the current field
        isAnswerExtracted : BOOLEAN,
        // Extracted answer for the current field
        extractedAnswer : STRING,
        // If answer is not extracted, provide the reason for failure, there could be only two reasons:
        // 1. User denied to provide data or provided invalid data, for this type of failure, provide the reason "inValidAnswer" in this field
        // 2. User is trying to provide data for other field, for this type of failure, provide the reason "wrongField" in this field
        reasonForFailure : STRING,
        // If user is trying to provide data for other field, then provide the field name and extracted answer for those fields
        otherFieldsData : [
          {
            fieldName : STRING,
            fieldValue : STRING
          },
          ...
        ] 
      }


    `;
    return {
      role: "system",
      content: systemPrompt,
    } as ChatCompletionRequestMessage;
  }

  getGenerateEndMessagePromptMessage({
    formOverview,
    fieldsWithData,
  }: {
    formOverview: string;
    fieldsWithData: FieldHavingData[];
  }) {
    const systemPrompt = `
    This platform lets users complete forms through conversational flow. User have provided all the required data for the form.
    Your task is to generate end message for the user based on the provided form information and fields.
    And You will act like professional human, and user should not feel like they are talking to a robot.

    Please adhere to the following rules while creating a conversational flow:

    RULES:
        - Keep message concise and clear – not exceeding 25 words – as users can view only one line at a time.

    Here is some context about the form responsible for its creation, followed by already provided fields data:

    Form Details: ${formOverview}

    Already Provided Fields Data:
        ${fieldsWithData
          .map((item) => `${item.fieldName}: ${item.fieldValue}`)
          .join("\n")}


    `;
    return {
      role: "system",
      content: systemPrompt,
    } as ChatCompletionRequestMessage;
  }

  getGenerateConversationNamePromptMessage({
    formOverview,
    fieldsWithData,
  }: {
    formOverview: string;
    fieldsWithData: FieldHavingData[];
  }) {
    const systemPrompt = `
    This platform lets users complete forms through conversational flow. User have provided all the required data for the form.
    Your task is to generate generate one word name from data collected from user, E.g. user name or email address etc.

    Here is some context about the form responsible for its creation, followed by already provided fields data:

    Form Details: ${formOverview}

    Already Provided Fields Data:
        ${fieldsWithData
          .map((item) => `${item.fieldName}: ${item.fieldValue}`)
          .join("\n")}

    

    ========================================

    FINAL OUTPUT FORMAT JSON:
      {
        conversationName : STRING,
      }

    `;
    return {
      role: "system",
      content: systemPrompt,
    } as ChatCompletionRequestMessage;
  }
}
