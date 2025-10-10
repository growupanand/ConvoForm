import { eq } from "@convoform/db";
import {
  form,
  getSafeFormFieldsOrders,
  restoreDateFields,
} from "@convoform/db/src/schema";
import type { ActionContext } from "../../types/actionContextType";

export async function getOneFormWithFields(formId: string, ctx: ActionContext) {
  const formWithFields = await ctx.db.query.form.findFirst({
    where: eq(form.id, formId),
    with: {
      formFields: true,
    },
    orderBy: (form, { asc }) => [asc(form.createdAt)],
  });

  if (!formWithFields) {
    return undefined;
  }

  const { formFields, ...restForm } = formWithFields;

  // Sort form fields
  const formFieldsOrders = getSafeFormFieldsOrders(restForm, formFields);
  const sortedFormFields = formFieldsOrders
    .map(
      // biome-ignore lint/style/noNonNullAssertion: ignored
      (id) => formFields.find((field) => field.id === id)!,
    )
    .map((field) => ({
      ...field,
      fieldConfiguration: restoreDateFields(field.fieldConfiguration),
    }));

  return {
    ...restForm,
    formFieldsOrders,
    formFields: sortedFormFields,
  };
}
