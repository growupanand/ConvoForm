"use client";

import {
  type FormField as FormFieldSchema,
  INPUT_TYPES_MAP,
  inputTypeEnum,
  updateFormFieldSchema,
} from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@convoform/ui/components/ui/form";
import { Input } from "@convoform/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@convoform/ui/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@convoform/ui/components/ui/sheet";
import { sonnerToast } from "@convoform/ui/components/ui/sonner";
import { Textarea } from "@convoform/ui/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@convoform/ui/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { ConfirmAction } from "@/components/common/confirmAction";
import { api } from "@/trpc/react";
import { InputConfigurationEditor } from "./inputConfigurationEditor";

type Props = {
  formField: FormFieldSchema;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formHookSchema = updateFormFieldSchema.omit({ id: true });
export type FormHookData = z.infer<typeof formHookSchema>;

export function EditFieldSheet({
  formField,
  open,
  onOpenChange,
}: Readonly<Props>) {
  const formDefaultValue = {
    fieldName: formField.fieldName,
    fieldDescription: formField.fieldDescription,
    fieldConfiguration: formField.fieldConfiguration,
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
    sonnerToast.promise(deletePromise, {
      loading: "Deleting field...",
      success: "Field deleted successfully",
      error: "Failed to delete field",
    });
  };

  const formHook = useForm({
    defaultValues: formDefaultValue,
    resolver: zodResolver(formHookSchema),
  });

  const selectedInputType = formHook.watch("fieldConfiguration.inputType");

  const onSubmit = (formData: FormHookData) => {
    const updatePromise = updateFormFieldMutation.mutateAsync({
      id: formField.id,
      ...formData,
    });

    sonnerToast.promise(updatePromise, {
      loading: "Saving changes...",
      success: "Changes saved successfully",
      error: "Failed to save changes",
    });
  };

  useEffect(() => {
    formHook.reset(formDefaultValue);
  }, [formField]);

  return (
    <Sheet open={open} onOpenChange={!isFormBusy ? onOpenChange : undefined}>
      <SheetContent side="left" className="w-full lg:min-w-[400px]">
        <SheetHeader>
          <SheetTitle>Edit form field</SheetTitle>
        </SheetHeader>

        <Form {...formHook}>
          <form
            onSubmit={formHook.handleSubmit(onSubmit)}
            className="relative flex h-full flex-col justify-between overflow-y-auto pe-5 ps-2 pt-5"
          >
            <div className="mb-10">
              <h4 className="mb-4 text-xl font-semibold">Question</h4>
              <div className="grid space-y-8">
                <FormField
                  control={formHook.control}
                  name="fieldName"
                  render={({ field }) => (
                    <FormItem>
                      <div className=" flex items-center gap-2">
                        <FormLabel>Internal name</FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="size-4" />
                          </TooltipTrigger>
                          <TooltipContent side="bottom" align="start">
                            This field is used for CSV export, as the column
                            name in the table, and as the field name in the form
                            submission page to show current field.
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Human readable name for the field"
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formHook.control}
                  name="fieldDescription"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Field description</FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 " />
                          </TooltipTrigger>
                          <TooltipContent side="bottom" align="start">
                            This text will be utilized by the AI to generate
                            questions.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder={
                            "Information you would like to collect.\nE.g. Your email address, Your work experience in years etc..."
                          }
                          {...field}
                          rows={4}
                          disabled={isFormBusy}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <h4 className="mb-4 mt-10 text-xl font-semibold">Answer</h4>
              <div className=" grid space-y-8">
                <div className="grid space-y-4">
                  <FormField
                    control={formHook.control}
                    name="fieldConfiguration.inputType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Input type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isFormBusy}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a verified email to display" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            {inputTypeEnum.enumValues.map((inputType) => (
                              <SelectItem key={inputType} value={inputType}>
                                {INPUT_TYPES_MAP[inputType].name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                          <FormMessage />
                        </Select>
                        <FormDescription className="flex items-center gap-2">
                          {INPUT_TYPES_MAP[field.value].description}
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <InputConfigurationEditor
                    inputType={selectedInputType}
                    formHook={formHook}
                  />
                </div>
              </div>
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
