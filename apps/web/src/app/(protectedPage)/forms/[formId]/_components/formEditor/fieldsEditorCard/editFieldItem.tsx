"use client";

import { useEffect, useRef } from "react";
import {
  FormField as FormFieldSchema,
  patchFormFieldSchema,
} from "@convoform/db/src/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@convoform/ui/components/ui/form";
import { Input } from "@convoform/ui/components/ui/input";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { cn } from "@convoform/ui/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Spinner from "@/components/common/spinner";
import { api } from "@/trpc/react";

type Props = {
  formField: FormFieldSchema;
};

const formHookSchema = patchFormFieldSchema.pick({ fieldDescription: true });
type FormHookData = z.infer<typeof formHookSchema>;

export function EditFieldItem({ formField }: Readonly<Props>) {
  // eslint-disable-next-line
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const updateFormField = api.formField.patchFormField.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["form"]],
      });
      toast({
        title: "Changes saved successfully",
        duration: 1500,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save changes",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isSavingFormField = updateFormField.isPending;

  const formHook = useForm({
    defaultValues: {
      fieldDescription: formField.fieldDescription,
    },
    resolver: zodResolver(formHookSchema),
  });

  const handleSaveField = (formData: FormHookData) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    updateFormField.mutate({
      id: formField.id,
      ...formData,
    });
  };

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (formHook.formState.isDirty) {
        formHook.handleSubmit((formData) => {
          handleSaveField(formData);
        })();
      }
    }, 2000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formHook.watch("fieldDescription")]);

  return (
    <Form {...formHook}>
      <form onSubmit={formHook.handleSubmit(handleSaveField)}>
        <FormField
          control={formHook.control}
          name="fieldDescription"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative flex items-center justify-between gap-x-3">
                  <Input
                    placeholder="Field description"
                    {...field}
                    disabled={isSavingFormField}
                  />
                  <div
                    className={cn(
                      "absolute -left-10 inline-block",
                      !isSavingFormField && "hidden",
                    )}
                  >
                    <Spinner />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
