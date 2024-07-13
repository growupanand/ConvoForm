"use client";

import { useMemo, useState } from "react";
import { Form, FormField } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { HandleUpdateFieldsOrder } from "../formEditorCard";
import { AddFieldItem } from "./addFieldItem";
import { EditFieldItem } from "./editFieldItem";
import { EditFieldSheet } from "./editFieldSheet";

type Props = {
  formFields: FormField[];
  formId: FormField["formId"];
  formFieldsOrders: Form["formFieldsOrders"];
  handleUpdateFieldsOrder: HandleUpdateFieldsOrder;
  isSavingForm: boolean;
};

type State = {
  showAddFieldEditor: boolean;
  showEditFieldSheet: boolean;
  /** Used to show the fields data on the Edit Field Sheet Drawer */
  currentEditField?: FormField;
};

export function FieldsEditorCard({
  formFields,
  formId,
  formFieldsOrders,
  handleUpdateFieldsOrder,
  isSavingForm,
}: Readonly<Props>) {
  const [state, setState] = useState<State>({
    showAddFieldEditor: false,
    showEditFieldSheet: false,
    currentEditField: undefined,
  });
  const { showAddFieldEditor, showEditFieldSheet, currentEditField } = state;

  const formFieldsMapByIds = useMemo(() => {
    return formFields.reduce<Record<string, FormField>>((acc, formField) => {
      acc[formField.id] = formField;
      return acc;
    }, {});
  }, [formFields, formFieldsOrders]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // If the item is dropped back to its initial position, do nothing
    if (over === null || active.id === over.id) {
      return;
    }

    const oldIndex = formFieldsOrders.indexOf(active.id.toString());
    const newIndex = formFieldsOrders.indexOf(over.id.toString());
    const updatedFieldsOrder = arrayMove(formFieldsOrders, oldIndex, newIndex);

    handleUpdateFieldsOrder(updatedFieldsOrder);
  }

  const handleShowAddFieldEditor = () => {
    setState((cs) => ({ ...cs, showAddFieldEditor: true }));
  };

  const handleHideAddFieldEditor = () => {
    setState((cs) => ({ ...cs, showAddFieldEditor: false }));
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
      // We don't set currentEditField to undefined here, So the sheet drawer closing animation will work,
      // Otherwise the sheet will close instantly without sliding effect
      // currentEditField: undefined,
    }));
  };

  return (
    <>
      {/* Fields list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={formFieldsOrders}
          strategy={verticalListSortingStrategy}
        >
          <div className=" grid gap-2">
            {formFieldsOrders.map((fieldId) => (
              <EditFieldItem
                key={fieldId}
                orderId={fieldId}
                formField={formFieldsMapByIds[fieldId]!}
                onEdit={handleShowEditFieldSheet}
                isSavingForm={isSavingForm}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Field Button/Editor */}
      <div className="mt-4">
        {showAddFieldEditor ? (
          <AddFieldItem
            onFieldAdded={handleHideAddFieldEditor}
            formId={formId}
          />
        ) : (
          <Button size="sm" type="button" onClick={handleShowAddFieldEditor}>
            <Plus className="mr-2 h-4 w-4" />
            Add field
          </Button>
        )}
      </div>

      {/* Edit Field Sheet */}
      {!!currentEditField && (
        <EditFieldSheet
          formField={currentEditField}
          open={showEditFieldSheet}
          onOpenChange={handleHideEditFieldSheet}
        />
      )}
    </>
  );
}
