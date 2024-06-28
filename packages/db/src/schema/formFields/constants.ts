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
    description: "User can give answer by typing",
  },
  multipleChoice: {
    name: "Multiple Choice",
    description:
      "User can give answer by selecting one or more predefined options",
  },
};
