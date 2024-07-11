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
import { sonnerToast } from "@convoform/ui/components/ui/sonner";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Grip, Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Spinner from "@/components/common/spinner";
import { api } from "@/trpc/react";

type Props = {
  formField: FormFieldSchema;
  onEdit: (formField: FormFieldSchema) => void;
  orderId: string;
};

const formHookSchema = patchFormFieldSchema.pick({ fieldDescription: true });
type FormHookData = z.infer<typeof formHookSchema>;

export function EditFieldItem({ formField, onEdit, orderId }: Readonly<Props>) {
  // eslint-disable-next-line
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const patchFormFieldMutation = api.formField.patchFormField.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["form"]],
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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: orderId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveField = (formData: FormHookData) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const patchFormPromise = patchFormFieldMutation.mutateAsync({
      id: formField.id,
      ...formData,
    });

    sonnerToast.promise(patchFormPromise, {
      loading: "Saving changes...",
      success: "Changes saved successfully",
      error: "Failed to save changes",
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
    <div ref={setNodeRef} style={style}>
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
                      disabled={isSavingFormField || isDragging}
                      className="grow"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isSavingFormField || isDragging}
                      onClick={() => onEdit(formField)}
                    >
                      {isSavingFormField ? (
                        <Spinner />
                      ) : (
                        <Settings className="size-4 " />
                      )}
                    </Button>
                    <span
                      style={{ cursor: isDragging ? "grabbing" : "grab" }}
                      {...listeners}
                      {...attributes}
                    >
                      <Grip className="stroke-muted-foreground size-4" />
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
