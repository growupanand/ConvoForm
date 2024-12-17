"use client";

import {
  type FormField as FormFieldSchema,
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
import { sonnerToast } from "@convoform/ui/components/ui/sonner";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Grip, Settings } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import Spinner from "@/components/common/spinner";
import { useAutoHeightHook } from "@/hooks/auto-height-hook";
import { api } from "@/trpc/react";
import { Textarea } from "@convoform/ui/components/ui/textarea";

type Props = {
  formField: FormFieldSchema;
  onEdit: (formField: FormFieldSchema) => void;
  orderId: string;
  isSavingForm: boolean;
  handleMoveFocusToNextField: (
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    currentFieldId: string,
  ) => void;
};

const formHookSchema = patchFormFieldSchema.pick({ fieldDescription: true });
type FormHookData = z.infer<typeof formHookSchema>;

export function EditFieldItem({
  formField,
  onEdit,
  orderId,
  isSavingForm,
  handleMoveFocusToNextField,
}: Readonly<Props>) {
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

  const fieldDescription = formHook.watch("fieldDescription");

  const { inputRef } = useAutoHeightHook({ value: fieldDescription });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: orderId, disabled: isSavingForm });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveField = (formData: FormHookData) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const patchFormFieldMutationPromise = patchFormFieldMutation.mutateAsync({
      id: formField.id,
      ...formData,
    });

    sonnerToast.promise(patchFormFieldMutationPromise, {
      loading: "Saving changes...",
      success: "Changes saved successfully",
      error: "Failed to save changes",
    });
  };

  const handleOnBlur = () => {
    timeoutRef.current = setTimeout(() => {
      if (formHook.formState.isDirty) {
        formHook.handleSubmit((formData) => {
          handleSaveField(formData);
        })();
      }
    }, 1000);
  };

  // Auto save description

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
  }, [fieldDescription]);

  // Reset form in react-hook-form when props change
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
                  <div className="relative flex items-start justify-between gap-x-1">
                    <div className="grow me-2">
                      <Textarea
                        placeholder="Field description"
                        {...field}
                        disabled={isSavingFormField || isDragging}
                        rows={1}
                        className="overflow-hidden"
                        id={formField.id}
                        onBlur={handleOnBlur}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                          }
                          handleMoveFocusToNextField(event, formField.id);
                        }}
                        ref={(e) => {
                          field.ref(e);
                          inputRef.current = e;
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="size-8 h-auto p-2 rounded-lg"
                      disabled={isSavingFormField || isDragging}
                      onClick={() => onEdit(formField)}
                    >
                      {isSavingFormField ? (
                        <Spinner />
                      ) : (
                        <Settings className="size-4 " />
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      type="button"
                      size="icon"
                      className="size-8 h-auto p-2 rounded-lg"
                      style={{
                        cursor: isSavingForm
                          ? "not-allowed"
                          : isDragging
                            ? "grabbing"
                            : "grab",
                      }}
                      {...listeners}
                      {...attributes}
                    >
                      <Grip className="stroke-muted-foreground size-4" />
                    </Button>
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
