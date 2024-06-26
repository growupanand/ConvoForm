import { FormField } from "@convoform/db/src/schema";

import { EditFieldItem } from "./editFieldItem";

type Props = {
  formFields: FormField[];
};

export function FieldsEditorCard({ formFields }: Readonly<Props>) {
  return (
    <div className="grid gap-2">
      {formFields.map((formField) => (
        <EditFieldItem key={formField.id} formField={formField} />
      ))}
    </div>
  );
}
