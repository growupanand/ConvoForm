import type { Conversation as DBConversation, Form } from "../../db/src/schema";

export type CoreConversation = DBConversation & {
  form: Form;
  currentFieldId: string | null;
};
