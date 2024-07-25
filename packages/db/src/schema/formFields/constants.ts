import { pgEnum } from "drizzle-orm/pg-core";

export const INPUT_TYPES = ["text", "multipleChoice", "datePicker"] as const;

export const inputTypeEnum = pgEnum("inputTypeEnum", INPUT_TYPES);

type InputTypeMap = Record<
  (typeof INPUT_TYPES)[number],
  {
    name: string;
    description: string;
    /** Should skip answer validation and save exact value in the database */
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
};
