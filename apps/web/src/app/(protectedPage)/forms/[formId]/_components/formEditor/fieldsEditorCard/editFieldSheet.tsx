"use client";

import { useEffect } from "react";
import {
  FormField as FormFieldSchema,
  INPUT_TYPES_MAP,
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
import { Textarea } from "@convoform/ui/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@convoform/ui/components/ui/tooltip";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
      toast({
        title: "Changes saved successfully",
        duration: 1500,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to save changes",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isSavingFormField = updateFormFieldMutation.isPending;

  const formHook = useForm({
    defaultValues: formDefaultValue,
    resolver: zodResolver(formHookSchema),
  });

  const selectedInputType = formHook.watch("fieldConfiguration.inputType");

  const onSubmit = (formData: FormHookData) => {
    updateFormFieldMutation.mutate({
      id: formField.id,
      ...formData,
    });
  };

  useEffect(() => {
    formHook.reset(formDefaultValue);
  }, [formField]);

  return (
    <Sheet
      open={open}
      onOpenChange={!isSavingFormField ? onOpenChange : undefined}
    >
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Edit form field</SheetTitle>
        </SheetHeader>
        <div className="relative h-full pt-5">
          <Form {...formHook}>
            <form onSubmit={formHook.handleSubmit(onSubmit)}>
              <div className="mb-10 grid h-full space-y-4">
                <h4 className="text-muted-foreground text-xl">
                  Question settings
                </h4>
                <FormField
                  control={formHook.control}
                  name="fieldDescription"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Field description</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 " />
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="start">
                              Will be used by AI for question generation
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <div className="flex items-center justify-between gap-x-3">
                          <Textarea
                            placeholder={`Information you would like to collect.\nE.g. Your email address, Your work experience in years etc...`}
                            {...field}
                            rows={4}
                            disabled={isSavingFormField}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formHook.control}
                  name="fieldName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Field name</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 " />
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="start">
                              Used for CSV export, Column name in Table etc...
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormDescription>
                        Internal name should not be changed
                      </FormDescription>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Human readable name for the field"
                          readOnly
                          disabled={isSavingFormField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid h-full space-y-4 ">
                <h4 className="text-muted-foreground text-xl">
                  Answer settings
                </h4>
                <FormField
                  control={formHook.control}
                  name="fieldConfiguration.inputType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Input type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSavingFormField}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a verified email to display" />
                          </SelectTrigger>
                        </FormControl>
                        <FormMessage />
                        <SelectContent>
                          {
                            // inputTypeEnum.enumValues  <-- uncomment this when multi choice input is ready
                            (["text"] as const).map((inputType) => (
                              <SelectItem key={inputType} value={inputType}>
                                {INPUT_TYPES_MAP[inputType].name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                        <FormDescription className="flex items-center gap-2">
                          <Info className="size-4 " />{" "}
                          {INPUT_TYPES_MAP[field.value].description}
                        </FormDescription>
                      </Select>
                    </FormItem>
                  )}
                />

                <InputConfigurationEditor
                  inputType={selectedInputType}
                  formHook={formHook}
                />

                <div className="absolute bottom-0 w-full py-5">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSavingFormField}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
