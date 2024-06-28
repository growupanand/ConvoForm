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

import Spinner from "@/components/common/spinner";
import { isRateLimitErrorResponse } from "@/lib/errorHandlers";
import { api } from "@/trpc/react";

type Props = {
  onFieldAdded: () => void;
  formId: string;
};

const formHookSchema = insertFormFieldSchema.pick({
  fieldName: true,
  fieldDescription: true,
});
type FormHookData = z.infer<typeof formHookSchema>;

export function AddFieldItem({ onFieldAdded, formId }: Readonly<Props>) {
  const queryClient = useQueryClient();

  const formHook = useForm({
    defaultValues: {
      fieldDescription: "",
      fieldName: "",
    },
    resolver: zodResolver(formHookSchema),
  });

  const createFormFieldMutation = api.formField.createFormField.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["form"]],
      });
      formHook.reset();
      toast({
        title: "Changes saved successfully",
        duration: 1500,
      });
      onFieldAdded();
    },
    onError: (error) => {
      toast({
        title: "Unable to save changes",
        duration: 1500,
        variant: "destructive",
        description: isRateLimitErrorResponse(error)
          ? error.message
          : undefined,
      });
    },
  });

  const isCreatingForm = createFormFieldMutation.isPending;

  const onSubmit = (formData: FormHookData) => {
    createFormFieldMutation.mutate({
      formId,
      ...formData,
      fieldConfiguration: {
        inputType: "text",
        inputConfiguration: {},
      },
    });
  };

  return (
    <Form {...formHook}>
      <form onSubmit={formHook.handleSubmit(onSubmit)}>
        <div className="grid space-y-4">
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
                <FormControl>
                  <div className="flex items-center justify-between gap-x-3">
                    <Input
                      placeholder="Human readable name for the field"
                      {...field}
                      disabled={isCreatingForm}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mt-4 grid w-full grid-cols-2 gap-x-4">
          <Button
            className="relative w-full"
            type="submit"
            disabled={isCreatingForm}
          >
            {isCreatingForm ? <Spinner size="sm" label="Saving" /> : "save"}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={onFieldAdded}
            disabled={isCreatingForm}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
