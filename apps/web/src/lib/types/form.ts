import type { Form, FormField } from "@convoform/db/src/schema";

export type FormWithFields = Form & {
  formFields: FormField[];
};
