import { ChatCompletionRequestMessage } from "openai-edge";
import { FormWithFields } from "../types/form";

export class SystemPromptService {
  form: FormWithFields;
  constructor(form: FormWithFields) {
    this.form = form;
  }

  getFormFieldNames() {
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
                 - If all fields are answered then you will save the form data into database without asking any question.
                 - Once form data is saved you will not save any data again.
                 - At the end send this message "Thank you for filling the form." Don't send any other message.
        
    
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
}
