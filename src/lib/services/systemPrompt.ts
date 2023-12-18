import { ChatCompletionRequestMessage } from "openai-edge";
import { ConversationForm } from "../types/form";

export class SystemPromptService {
  form: ConversationForm;
  constructor(form: ConversationForm) {
    this.form = form;
  }

  private getFormFieldNames() {
    return this.form.formField.map((item) => item.fieldName);
  }

  getConversationFlowPrompt() {
    return `
        This is a website where user can fill form. You are required to create a conversation flow for the form.
    
    
        Follow below rules to create conversation flow.
            RULES:
                 - Only ask questions for the form fields provided.
                 - You will ask only one field question at a time and in sequence.
                 - You will validate every form field value provided by user and on invalid value ask user to confirm this value.
                 - Question should be in one line string format not more than 25 words, because user will be able to see only one line at a time.
                 - If all fields are answered then message postfix should be "finish". I will use this postfix to identify if conversation is finished.
                 For example: "Thank you for filling the form. [finish]"
        
    
        Below is form context and fields information.
    
        About the form: ${this.form.overview}
        
        About company who have created the form: ${this.form.aboutCompany}
    
        Form fields: [${this.getFormFieldNames().join(", ")}]
        `;
  }

  getConversationFlowPromptMessage() {
    return {
      role: "system",
      content: this.getConversationFlowPrompt(),
    } as ChatCompletionRequestMessage;
  }

  getConversationJSONPrompt() {
    return `
    Previously you were a website where user can fill form.
    Now you have all the form data filled by user. You need to create a JSON object from this data.

      Follow below rules to create JSON object.

      RULES:
              - JSON object should have key value pair for every form field provided.
              - Key should be same as field name provided.
              - Value should be same as field valid or confirmed value provided.
              - Response should only be json object and nothing else. which can be parsed by JSON.parse() method.
              - Don't send any other data in response.
              

      JSON object example:

      {
          "name": "John Doe",
          "email": "asdfj@gmial.com",
          "phone": "1234567890",
      }


    Below is form context and fields information.

    About the form: ${this.form.overview}
    
    About company who have created the form: ${this.form.aboutCompany}

    Form fields: [${this.getFormFieldNames().join(", ")}]
    `;
  }

  getConversationJSONPromptMessage() {
    return {
      role: "system",
      content: this.getConversationJSONPrompt(),
    } as ChatCompletionRequestMessage;
  }
}
