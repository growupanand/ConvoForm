"use client";

import { useState } from "react";
import { FormField } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";
import { Plus } from "lucide-react";

import { AddFieldItem } from "./addFieldItem";
import { EditFieldItem } from "./editFieldItem";
import { EditFieldSheet } from "./editFieldSheet";

type Props = {
  formFields: FormField[];
  formId: FormField["formId"];
};

type State = {
  showAddField: boolean;
  showEditFieldSheet: boolean;
  currentEditField?: FormField;
};

export function FieldsEditorCard({ formFields, formId }: Readonly<Props>) {
  const [state, setState] = useState<State>({
    showAddField: false,
    showEditFieldSheet: false,
    currentEditField: undefined,
  });
  const { showAddField, showEditFieldSheet, currentEditField } = state;

  const handleShowAddField = () => {
    setState((cs) => ({ ...cs, showAddField: true }));
  };

  const handleHideAddField = () => {
    setState((cs) => ({ ...cs, showAddField: false }));
  };

  const handleShowEditFieldSheet = (formField: FormField) => {
    setState((cs) => ({
      ...cs,
      showEditFieldSheet: true,
      currentEditField: formField,
    }));
  };

  const handleHideEditFieldSheet = () => {
    setState((cs) => ({
      ...cs,
      showEditFieldSheet: false,
    }));
  };

  return (
    <div className=" grid gap-2">
      {formFields.map((formField) => (
        <EditFieldItem
          key={formField.id}
          formField={formField}
          onEdit={handleShowEditFieldSheet}
        />
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
      {!!currentEditField && (
        <EditFieldSheet
          formField={currentEditField}
          open={showEditFieldSheet}
          onOpenChange={handleHideEditFieldSheet}
        />
      )}
    </div>
  );
}
