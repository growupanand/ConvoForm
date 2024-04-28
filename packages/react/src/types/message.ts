export type Message = {
  role: "user" | "assistant";
  content: string;
  fieldName?: string;
};
