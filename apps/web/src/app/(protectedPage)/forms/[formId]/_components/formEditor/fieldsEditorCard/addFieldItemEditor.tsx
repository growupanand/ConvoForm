"use client";

import { insertFormFieldSchema } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@convoform/ui/components/ui/form";
import { Input } from "@convoform/ui/components/ui/input";
import { sonnerToast } from "@convoform/ui/components/ui/sonner";
import { Textarea } from "@convoform/ui/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@convoform/ui/components/ui/tooltip";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import Spinner from "@/components/common/spinner";
import { useAutoHeightHook } from "@/hooks/auto-height-hook";
import { api } from "@/trpc/react";
import { isRateLimitErrorResponse } from "@convoform/rate-limiter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@convoform/ui/components/ui/sheet";

type Props = {
  onFieldAdded: () => void;
  formId: string;
  showAddFieldEditor: boolean;
  handleHideAddFieldSheet: () => void;
};

const formHookSchema = insertFormFieldSchema.pick({
  fieldName: true,
  fieldDescription: true,
});
type FormHookData = z.infer<typeof formHookSchema>;

export function AddFieldItemEditor({
  onFieldAdded,
  formId,
  showAddFieldEditor,
  handleHideAddFieldSheet,
}: Readonly<Props>) {
  const queryClient = useQueryClient();

  const formHook = useForm({
    defaultValues: {
      fieldDescription: "",
      fieldName: "",
    },
    resolver: zodResolver(formHookSchema),
  });

  const fieldDescription = formHook.watch("fieldDescription");

  const { inputRef } = useAutoHeightHook({ value: fieldDescription });

  const createFormFieldMutation = api.formField.createFormField.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["form"]],
      });
      formHook.reset();
      onFieldAdded();
    },
    onError: (error) => {
      if (isRateLimitErrorResponse(error)) {
        toast({
          title: "Rate limit exceeded",
          duration: 1500,
          variant: "destructive",
          description: error.message,
        });
      }
    },
  });

  const isCreatingForm = createFormFieldMutation.isPending;

  const onSubmit = (formData: FormHookData) => {
    const createFormFieldPromise = createFormFieldMutation.mutateAsync({
      formId,
      ...formData,
      fieldConfiguration: {
        inputType: "text",
        inputConfiguration: {},
      },
    });

    sonnerToast.promise(createFormFieldPromise, {
      loading: "Adding field...",
      success: "Field added successfully",
      error: "Failed to add field",
    });
  };

  return (
    <Sheet open={showAddFieldEditor} onOpenChange={handleHideAddFieldSheet}>
      <SheetContent side="left" className="w-full min-w-[400px] flex flex-col">
        <SheetHeader className="mb-4">
          <SheetTitle>New question</SheetTitle>
        </SheetHeader>
        <Form {...formHook}>
          <form
            onSubmit={formHook.handleSubmit(onSubmit)}
            className="grow flex flex-col "
          >
            <div className="grid space-y-8 mb-10">
              <FormField
                control={formHook.control}
                name="fieldName"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Internal name</FormLabel>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 " />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="start">
                          This field is used for CSV export, as the column name
                          in the table, and as the field name in the form
                          submission page to show current field.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <FormControl>
                      <div className="flex items-center justify-between gap-x-3">
                        <Input
                          placeholder="Field name (e.g. Name, Email, etc.)"
                          {...field}
                          disabled={isCreatingForm}
                        />
                      </div>
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
                      <div className="flex items-center justify-between gap-x-3">
                        <Textarea
                          placeholder={
                            "Information you would like to collect (e.g. Tell me your full name, etc.)"
                          }
                          {...field}
                          rows={3}
                          disabled={isCreatingForm}
                          ref={(e) => {
                            field.ref(e);
                            inputRef.current = e;
                          }}
                          onKeyDown={(e) => {
                            // disable enter key from submitting the form or inserting a new line
                            if (e.key === "Enter") {
                              e.preventDefault();
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <Button
                className="relative w-full"
                type="submit"
                disabled={isCreatingForm}
              >
                {isCreatingForm ? <Spinner size="sm" label="Saving" /> : "save"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
