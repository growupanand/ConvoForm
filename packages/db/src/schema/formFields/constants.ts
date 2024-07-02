import { pgEnum } from "drizzle-orm/pg-core";

export const INPUT_TYPES = ["text", "multipleChoice"] as const;

export const inputTypeEnum = pgEnum("inputTypeEnum", INPUT_TYPES);

type InputTypeMap = Record<
  (typeof INPUT_TYPES)[number],
  { name: string; description: string }
>;

export const INPUT_TYPES_MAP: InputTypeMap = {
  text: {
    name: "Text",
    description: "Respondent can type answer",
  },
  multipleChoice: {
    name: "Multiple Choice",
    description: "Respondent can choose answer from given choices",
  },
};
