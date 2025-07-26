import { pgEnum } from "drizzle-orm/pg-core";

export const INPUT_TYPES = [
  "text",
  "multipleChoice",
  "datePicker",
  "rating",
  "fileUpload",
] as const;

export const inputTypeEnum = pgEnum("inputTypeEnum", INPUT_TYPES);

type InputTypeMap = Record<
  (typeof INPUT_TYPES)[number],
  {
    name: string;
    description: string;
    /**
     * When true, the exact value provided by the user is saved in the database without validation.
     * When false, the value goes through validation (E.g using AI to validate) and processing before being stored.
     */
    saveExactValue: boolean;
  }
>;

export const INPUT_TYPES_MAP: InputTypeMap = {
  text: {
    name: "Text",
    description: "Respondent can type an answer",
    saveExactValue: false,
  },
  multipleChoice: {
    name: "Multiple Choice",
    description: "Respondent can select an answer from a list of choices",
    saveExactValue: true,
  },
  datePicker: {
    name: "Date Picker",
    description: "Respondent can pick a date",
    saveExactValue: true,
  },
  rating: {
    name: "Rating",
    description: "Respondent can rate on a scale using stars",
    saveExactValue: true,
  },
  fileUpload: {
    name: "File Upload",
    description: "Respondent can upload files (images, PDFs)",
    saveExactValue: true,
  },
};
