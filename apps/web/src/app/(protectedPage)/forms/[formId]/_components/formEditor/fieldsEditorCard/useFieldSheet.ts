import {
  type FormField as FormFieldSchema,
  updateFormFieldSchema,
} from "@convoform/db/src/schema";
import { toast } from "@convoform/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod/v4";

import { useAutoHeightHook } from "@/hooks/auto-height-hook";
import { api } from "@/trpc/react";

const formHookSchema = updateFormFieldSchema.omit({ id: true });
export type FormHookData = z.infer<typeof formHookSchema>;

type UseFieldSheetProps = {
  formField: FormFieldSchema;
  formFields: FormFieldSchema[];
  onOpenChange: (open: boolean) => void;
};

export function useFieldSheet({
  formField,
  formFields,
  onOpenChange,
}: UseFieldSheetProps) {
  const formDefaultValue: FormHookData = {
    fieldName: formField.fieldName,
    fieldDescription: formField.fieldDescription,
    fieldConfiguration:
      formField.fieldConfiguration as FormHookData["fieldConfiguration"],
  };

  const queryClient = useQueryClient();
  const updateFormFieldMutation = api.formField.updateFormField.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["form"]],
      });
      onOpenChange(false);
    },
  });

  const isSavingFormField = updateFormFieldMutation.isPending;

  const deleteFormFieldMutation = api.formField.deleteFormField.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["form"]],
      });
      onOpenChange(false);
    },
  });

  const isDeletingFormField = deleteFormFieldMutation.isPending;
  const isFormBusy = isDeletingFormField || isSavingFormField;

  const handleDeleteField = () => {
    const deletePromise = deleteFormFieldMutation.mutateAsync({
      id: formField.id,
    });
    toast.promise(deletePromise, {
      loading: "Deleting field...",
      success: "Field deleted successfully",
      error: "Failed to delete field",
    });
  };

  const formHook = useForm<FormHookData>({
    defaultValues: formDefaultValue,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formHookSchema) as any,
  });

  const selectedInputType = formHook.watch("fieldConfiguration.inputType");
  const fieldDescription = formHook.watch("fieldDescription");

  // Check if a file upload field already exists in the form (excluding current field)
  const hasExistingFileUploadField = formFields.some(
    (field) =>
      field.fieldConfiguration.inputType === "fileUpload" &&
      field.id !== formField.id,
  );

  const { inputRef } = useAutoHeightHook({ value: fieldDescription });

  const onSubmit = (formData: FormHookData) => {
    const updatePromise = updateFormFieldMutation.mutateAsync({
      id: formField.id,
      ...formData,
    });

    toast.promise(updatePromise, {
      loading: "Saving changes...",
      success: "Changes saved successfully",
      error: "Failed to save changes",
    });
  };

  useEffect(() => {
    formHook.reset(formDefaultValue);
  }, [formField]);

  return {
    formHook,
    isFormBusy,
    handleDeleteField,
    onSubmit,
    hasExistingFileUploadField,
    inputRef,
    selectedInputType,
  };
}
