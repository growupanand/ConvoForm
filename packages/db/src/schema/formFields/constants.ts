import { INPUT_TYPES } from "./formField";

type InputTypeMap = Record<
  (typeof INPUT_TYPES)[number],
  { name: string; description: string }
>;

export const INPUT_TYPES_MAP: InputTypeMap = {
  text: {
    name: "Text",
    description: "User can write any text",
  },
};
