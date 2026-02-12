"use client";

import type { FormField as FormFieldSchema } from "@convoform/db/src/schema";
import {
  Form,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@convoform/ui";
import { FieldBasicInfo } from "./fieldBasicInfo";
import { FieldConfiguration } from "./fieldConfiguration";
import { FieldSheetActions } from "./fieldSheetActions";
import { useFieldSheet } from "./useFieldSheet";

type Props = {
  formField: FormFieldSchema;
  formFields: FormFieldSchema[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditFieldSheet({
  formField,
  formFields,
  open,
  onOpenChange,
}: Readonly<Props>) {
  const {
    formHook,
    isFormBusy,
    onSubmit,
    handleDeleteField,
    selectedInputType,
    hasExistingFileUploadField,
    inputRef,
  } = useFieldSheet({ formField, formFields, onOpenChange });

  return (
    <Sheet open={open} onOpenChange={!isFormBusy ? onOpenChange : undefined}>
      <SheetContent
        side="left"
        className=" w-[500px] min-w-[500px] max-w-[500px] space-y-6"
      >
        <SheetHeader>
          <SheetTitle>Edit form field</SheetTitle>
        </SheetHeader>

        <Form {...formHook}>
          <form
            onSubmit={formHook.handleSubmit(onSubmit)}
            className="relative flex h-full flex-col justify-between overflow-y-auto pe-5 ps-2 pb-4"
          >
            <div className="mb-6 space-y-10">
              <FieldBasicInfo
                formHook={formHook}
                isFormBusy={isFormBusy}
                inputRef={inputRef}
              />
              <FieldConfiguration
                formHook={formHook}
                isFormBusy={isFormBusy}
                hasExistingFileUploadField={hasExistingFileUploadField}
                selectedInputType={selectedInputType}
              />
            </div>
            <FieldSheetActions
              isFormBusy={isFormBusy}
              onDelete={handleDeleteField}
            />
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
