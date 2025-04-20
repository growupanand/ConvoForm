import type { FieldConfiguration } from "../formFields";
import type { NewForm } from "../forms";
import type {
  GoogleForm,
  GoogleFormDateQuestion,
  GoogleFormQuestionItem,
  GoogleFormTextQuestion,
} from "./validation";

enum GoogleQuestionType {
  TEXT = "TEXT",
  DATE = "DATE",
}

// Type guard for text questions
function isTextQuestion(
  question: GoogleFormQuestionItem["questionItem"]["question"],
): question is GoogleFormQuestionItem["questionItem"]["question"] &
  GoogleFormTextQuestion {
  return "textQuestion" in question;
}

// Type guard for date questions
function isDateQuestion(
  question: GoogleFormQuestionItem["questionItem"]["question"],
): question is GoogleFormQuestionItem["questionItem"]["question"] &
  GoogleFormDateQuestion {
  return "dateQuestion" in question;
}

const getQuestionItemType = (questionItem: GoogleFormQuestionItem) => {
  if (isTextQuestion(questionItem.questionItem.question)) {
    return GoogleQuestionType.TEXT;
  }

  if (isDateQuestion(questionItem.questionItem.question)) {
    return GoogleQuestionType.DATE;
  }

  return "unkown";
};

/**
 * Converts a Google Form to a ConvoForm NewForm,
 * which can be used to create a new form.
 *
 * @param googleForm - The Google Form to convert.
 * @returns The converted NewForm.
 */
export const convertGoogleFormToNewForm = (googleForm: GoogleForm): NewForm => {
  const newFormFields: NewForm["formFields"] = [];

  // Process each item from the Google Form
  googleForm.items.forEach((item) => {
    const isTitleSet = item.title && item.title.trim().length > 0;
    const isDescriptionSet =
      item.description && item.description.trim().length > 0;
    const questionItemType = getQuestionItemType(item);

    // Process only question items as form fields
    if (
      "questionItem" in item &&
      questionItemType !== "unkown" &&
      item.title &&
      isTitleSet
    ) {
      // Create a form field based on the question type
      const formField = {
        fieldName: item.title,
        fieldDescription:
          item.description && isDescriptionSet ? item.description : item.title,
        fieldConfiguration: mapQuestionTypeToFieldConfiguration(item),
      };

      newFormFields.push(formField);
    }
    // Note: We're skipping non-question items like pageBreak, text, image, video
    // as they don't directly map to form fields
  });

  // Add a default name field if no fields were processed
  if (newFormFields.length === 0) {
    newFormFields.push({
      fieldName: "Name",
      fieldDescription: "Name of the respondent",
      fieldConfiguration: {
        inputType: "text",
        inputConfiguration: {},
      },
    });
  }

  const isFormDescriptionSet = Boolean(
    googleForm.info.description &&
      googleForm.info.description.trim().length > 0,
  );
  const welcomeScreenMessage =
    (isFormDescriptionSet && googleForm.info.description) ||
    "Start filling out the form by clicking the button below.";

  const overview =
    (isFormDescriptionSet && googleForm.info.description) ||
    "This form is designed to collect relevant information from respondents. Please provide accurate details to help us process your submission effectively.";

  return {
    name: googleForm.info.documentTitle ?? googleForm.info.title,
    overview,
    welcomeScreenTitle: googleForm.info.title,
    welcomeScreenMessage,
    welcomeScreenCTALabel: "Start",
    formFields: newFormFields,
    formFieldsOrders: [],
  };
};

/**
 * Maps a Google Form question type to the appropriate field configuration
 * for our application.
 *
 * @param question - The Google Form question to convert
 * @returns The field configuration for our application
 */
const mapQuestionTypeToFieldConfiguration = (
  questionItem: GoogleFormQuestionItem,
): FieldConfiguration => {
  const questionType = getQuestionItemType(questionItem);
  const question = questionItem.questionItem.question;

  if (questionType === GoogleQuestionType.TEXT && isTextQuestion(question)) {
    return {
      inputType: "text",
      inputConfiguration: {
        isParagraph: question.textQuestion.paragraph || false,
      },
    };
  }
  if (questionType === GoogleQuestionType.DATE && isDateQuestion(question)) {
    return {
      inputType: "datePicker",
      inputConfiguration: {},
    };
  }
  return {
    inputType: "text",
    inputConfiguration: {},
  };
};
