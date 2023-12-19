import { Form, FormField } from "@prisma/client";

export type FormWithFields = Form & {
  formField: FormField[];
};
