import {
  type FormField as FormFieldSchema,
  type Form as FormSchema,
  getSafeFormFieldsOrders,
} from "@convoform/db/src/schema";
import { toast } from "@convoform/ui";
import { useEffect, useState } from "react";

type State = {
  fieldsOrders: string[];
  formFields: FormFieldSchema[];
};

export type HandleUpdateFieldsOrder = (newFieldsOrder: string[]) => void;

export function useFormFieldsState(
  form: FormSchema & { formFields: FormFieldSchema[] },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateFormMutation: any,
) {
  const [state, setState] = useState<State>({
    fieldsOrders: getSafeFormFieldsOrders(form, form.formFields),
    formFields: form.formFields,
  });

  const { fieldsOrders, formFields } = state;

  useEffect(() => {
    setState((cs) => ({
      ...cs,
      formFields: form.formFields,
      fieldsOrders: getSafeFormFieldsOrders(form, form.formFields),
    }));
  }, [form.formFields]);

  const handleUpdateFieldsOrder: HandleUpdateFieldsOrder = (newFieldsOrder) => {
    // First update instantly in the browser UI, so that dragged fields can be seen in new order
    setState((cs) => ({ ...cs, fieldsOrders: newFieldsOrder }));

    // Now update in database
    const updateFormPromise = updateFormMutation.mutateAsync({
      ...form,
      formFieldsOrders: newFieldsOrder,
    });
    toast.promise(updateFormPromise, {
      loading: "Saving order...",
      success: "Saved successfully",
      error: "Failed to save fields order",
    });
  };

  return {
    fieldsOrders,
    formFields,
    handleUpdateFieldsOrder,
  };
}
