import { Form, FormField } from "@convoform/db";

export type FormWithFields = Form & {
  formFields: FormField[];
};
