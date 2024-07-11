"use client";

import { useMemo, useState } from "react";
import { FormField } from "@convoform/db/src/schema";
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
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
  fieldsOrder: string[];
};

export function FieldsEditorCard({ formFields, formId }: Readonly<Props>) {
  const [state, setState] = useState<State>({
    showAddField: false,
    showEditFieldSheet: false,
    currentEditField: undefined,
    fieldsOrder: formFields.map((formField) => formField.id),
  });
  const { showAddField, showEditFieldSheet, currentEditField, fieldsOrder } =
    state;

  const formFieldsMapByIds = useMemo(() => {
    console.log("computing formFieldsMapByIds");
    return formFields.reduce<Record<string, FormField>>((acc, formField) => {
      acc[formField.id] = formField;
      return acc;
    }, {});
  }, [formFields]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over !== null && active.id !== over.id) {
      setState((cs) => {
        const fieldsOrder = cs.fieldsOrder;
        const oldIndex = fieldsOrder.indexOf(active.id.toString());
        const newIndex = fieldsOrder.indexOf(over.id.toString());

        const updatedFieldsOrder = arrayMove(fieldsOrder, oldIndex, newIndex);

        return { ...cs, fieldsOrder: updatedFieldsOrder };
      });
    }
  }

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
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fieldsOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className=" grid gap-2">
            {fieldsOrder.map((fieldId) => (
              <EditFieldItem
                key={fieldId}
                orderId={fieldId}
                formField={formFieldsMapByIds[fieldId]!}
                onEdit={handleShowEditFieldSheet}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="mt-4">
        {showAddField ? (
          <AddFieldItem onFieldAdded={handleHideAddField} formId={formId} />
        ) : (
          <Button size="sm" type="button" onClick={handleShowAddField}>
            <Plus className="mr-2 h-4 w-4" />
            Add field
          </Button>
        )}
        {!!currentEditField && (
          <EditFieldSheet
            formField={currentEditField}
            open={showEditFieldSheet}
            onOpenChange={handleHideEditFieldSheet}
          />
        )}
      </div>
    </>
  );
}
