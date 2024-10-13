"use client";

import type { Form, FormField } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { type KeyboardEvent, useMemo, useRef, useState } from "react";

import type { HandleUpdateFieldsOrder } from "../formEditorCard";
import { AddFieldItemEditor } from "./addFieldItemEditor";
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
  const editFieldsListRef = useRef<HTMLDivElement>(null);

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

  const handleMoveFocusToNextField = (
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    currentFieldId: string,
  ) => {
    if (
      !editFieldsListRef.current ||
      (event.key !== "ArrowDown" && event.key !== "ArrowUp") ||
      !event.shiftKey
    ) {
      return;
    }

    event.preventDefault();

    const currentFieldIndex = formFieldsOrders.indexOf(currentFieldId);
    let nextFieldIndex = 0;

    // If user presses down arrow key, move focus to the next field
    if (event.key === "ArrowDown" && event.shiftKey) {
      nextFieldIndex = currentFieldIndex + 1;
    }

    // If user presses up arrow key, move focus to the previous field
    if (event.key === "ArrowUp" && event.shiftKey) {
      nextFieldIndex = currentFieldIndex - 1;
    }

    // If the next field exists, move focus to it
    if (nextFieldIndex < formFieldsOrders.length) {
      const nextFieldId = formFieldsOrders[nextFieldIndex];
      if (nextFieldId) {
        const inputElement = editFieldsListRef.current.querySelector(
          `textarea[id="${nextFieldId}"]`,
        ) as HTMLInputElement | HTMLTextAreaElement;
        if (inputElement) {
          inputElement.focus();
        }
      }
    }
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
          <div ref={editFieldsListRef} className="grid gap-2">
            {formFieldsOrders.map((fieldId) => (
              <EditFieldItem
                key={fieldId}
                orderId={fieldId}
                formField={
                  // biome-ignore lint/style/noNonNullAssertion: reason
                  formFieldsMapByIds[fieldId]!
                }
                onEdit={handleShowEditFieldSheet}
                isSavingForm={isSavingForm}
                handleMoveFocusToNextField={handleMoveFocusToNextField}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Field Button/Editor */}

      {showAddFieldEditor ? (
        <div className="pt-10">
          <AddFieldItemEditor
            onFieldAdded={handleHideAddFieldEditor}
            formId={formId}
          />
        </div>
      ) : (
        <div className="pt-4">
          <Button size="sm" type="button" onClick={handleShowAddFieldEditor}>
            <Plus className="mr-2 size-4" />
            Add question
          </Button>
        </div>
      )}

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
