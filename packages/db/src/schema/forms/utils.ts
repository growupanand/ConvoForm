import type { FormField } from "../formFields";
import type { Form } from "./validation";

export function isValidFormFieldsOrders(
  form: Pick<Form, "formFieldsOrders">,
  formFields: FormField[],
) {
  const totalFormFieldsOrdersCount = form.formFieldsOrders.length;
  const totalFormFieldsCount = formFields.length;
  return totalFormFieldsOrdersCount === totalFormFieldsCount;
}

export function getSafeFormFieldsOrders(
  form: Pick<Form, "formFieldsOrders">,
  formFields: FormField[],
) {
  if (isValidFormFieldsOrders(form, formFields)) {
    return form.formFieldsOrders;
  }
  return formFields.map((formField) => formField.id);
}
