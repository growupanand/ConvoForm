"use client";

import { useEffect, useRef } from "react";
import {
  FormField as FormFieldSchema,
  patchFormFieldSchema,
} from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@convoform/ui/components/ui/form";
import { Input } from "@convoform/ui/components/ui/input";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Spinner from "@/components/common/spinner";
import { api } from "@/trpc/react";

type Props = {
  formField: FormFieldSchema;
  onEdit: (formField: FormFieldSchema) => void;
};

const formHookSchema = patchFormFieldSchema.pick({ fieldDescription: true });
type FormHookData = z.infer<typeof formHookSchema>;

export function EditFieldItem({ formField, onEdit }: Readonly<Props>) {
  // eslint-disable-next-line
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const patchFormFieldMutation = api.formField.patchFormField.useMutation({
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

  const isSavingFormField = patchFormFieldMutation.isPending;

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
    patchFormFieldMutation.mutate({
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
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formHook.watch("fieldDescription")]);

  useEffect(() => {
    formHook.reset({
      fieldDescription: formField.fieldDescription,
    });
  }, [formField]);

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
                    className="grow"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isSavingFormField}
                    onClick={() => onEdit(formField)}
                  >
                    {isSavingFormField ? (
                      <Spinner />
                    ) : (
                      <Settings className="size-4" />
                    )}
                  </Button>
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
