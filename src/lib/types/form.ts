import { Form, FormField } from "@prisma/client";

export type ConversationForm = Form & {
  formField: FormField[];
};
