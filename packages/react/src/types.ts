export type JSONValue =
  | null
  | string
  | number
  | boolean
  | {
      [x: string]: JSONValue;
    }
  | Array<JSONValue>;

export type Message = {
  role: "user" | "assistant";
  content: string;
  fieldName?: string;
};
