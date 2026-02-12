"use client";

import type { FormField as FormFieldSchema } from "@convoform/db/src/schema";
import {
  Button,
  Form,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@convoform/ui";

import { ConfirmAction } from "@/components/common/confirmAction";
import { FieldBasicInfo } from "./fieldBasicInfo";
import { FieldConfiguration } from "./fieldConfiguration";
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
            <div className="bg-background sticky bottom-0 mt-auto w-full py-5">
              <div className="grid gap-2">
                <Button type="submit" className="w-full" disabled={isFormBusy}>
                  Save
                </Button>
                <ConfirmAction
                  onConfirm={handleDeleteField}
                  title="Are you sure you want to delete this field?"
                  description="This action cannot be undone."
                  confirmText="Delete field"
                >
                  <Button
                    type="button"
                    className=" w-full "
                    disabled={isFormBusy}
                    variant="ghost"
                  >
                    Delete field
                  </Button>
                </ConfirmAction>
              </div>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
