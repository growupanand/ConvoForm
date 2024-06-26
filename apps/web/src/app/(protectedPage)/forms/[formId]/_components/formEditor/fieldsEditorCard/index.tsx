"use client";

import { useState } from "react";
import { FormField } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";
import { Plus } from "lucide-react";

import { AddFieldItem } from "./addFieldItem";
import { EditFieldItem } from "./editFieldItem";

type Props = {
  formFields: FormField[];
  formId: FormField["formId"];
};

type State = {
  showAddField: boolean;
};

export function FieldsEditorCard({ formFields, formId }: Readonly<Props>) {
  const [state, setState] = useState<State>({
    showAddField: false,
  });
  const { showAddField } = state;

  const handleShowAddField = () => {
    setState({
      showAddField: true,
    });
  };

  const handleHideAddField = () => {
    setState({
      showAddField: false,
    });
  };

  return (
    <div className=" grid gap-2">
      {formFields.map((formField) => (
        <EditFieldItem key={formField.id} formField={formField} />
      ))}
      <div className="mt-4">
        {showAddField ? (
          <AddFieldItem onFieldAdded={handleHideAddField} formId={formId} />
        ) : (
          <Button size="sm" type="button" onClick={handleShowAddField}>
            <Plus className="mr-2 h-4 w-4" />
            Add field
          </Button>
        )}
      </div>
    </div>
  );
}
