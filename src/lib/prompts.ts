export const getSystemPrompt = (
  formOverview: string,
  aboutCompany: string,
  formFields: string[],
  isFormSubmitted: boolean
) => {
  if (!isFormSubmitted) {
    return getFormFlowPrompt(formOverview, aboutCompany, formFields);
  }

  return getFormDataJsonPrompt(formOverview, aboutCompany, formFields);
};

const getFormFlowPrompt = (
  formOverview: string,
  aboutCompany: string,
  formFields: string[]
) => {
  return `
    This is a website where user can fill form. You are required to create a conversation flow for the form.


    Follow below rules to create conversation flow.
        RULES:
             - Only ask questions for the form fields provided.
             - You will ask only one field question at a time and in sequence.
             - You will validate every form field value provided by user and on invalid value ask user to confirm this value.
             - Question should be in one line string format not more than 25 words, because user will be able to see only one line at a time.
             - Every Question whether it is asked to confirm a invalid value, must have postfix "[field name]" at the end of question. 
             and if all fields are answered then postfix should be "finish". I will use this postfix to identify which field question is asked for.
             For example: "What is your name? [name]" or "Just to confirm, is sdaklfjsdklaf@sflkajsdlkf correct?? [email]" or "Thank you for filling the form. [finish]"
    

    Below is form context and fields information.

    About the form: ${formOverview}
    
    About company who have created the form: ${aboutCompany}

    Form fields: [${formFields.join(", ")}]
    `;
};

const getFormDataJsonPrompt = (
  formOverview: string,
  aboutCompany: string,
  formFields: string[]
) => {
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
  
      About the form: ${formOverview}
      
      About company who have created the form: ${aboutCompany}
  
      Form fields: [${formFields.join(", ")}]
      `;
};
