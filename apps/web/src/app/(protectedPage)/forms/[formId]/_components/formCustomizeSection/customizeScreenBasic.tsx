"use client";

import { debounce } from "@/lib/utils";
import {
  type FormDesignRenderSchema,
  patchFormDesignSchema,
} from "@convoform/db/src/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@convoform/ui/components/ui/form";
import { Input } from "@convoform/ui/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type Props = {
  formDesign: FormDesignRenderSchema;
  onUpdateFormDesign: (updatedFormDesign: FormDesignRenderSchema) => void;
  isSavingFormDesign: boolean;
};

const formHookSchema = patchFormDesignSchema
  .pick({
    backgroundColor: true,
    fontColor: true,
  })
  .required();
type FormHookData = z.infer<typeof formHookSchema>;

const basicFields = [
  {
    fieldName: "backgroundColor",
    fieldLabel: "Background color",
  },
  {
    fieldName: "fontColor",
    fieldLabel: "Font color",
  },
] as const;

export function CustomizeScreenBasicCard({
  formDesign,
  onUpdateFormDesign,
  isSavingFormDesign,
}: Readonly<Props>) {
  const formHook = useForm<FormHookData>({
    defaultValues: {
      backgroundColor: formDesign.backgroundColor,
      fontColor: formDesign.fontColor,
    },
    resolver: zodResolver(formHookSchema),
    mode: "onChange",
  });

  const onSubmit = (formData: FormHookData) => {
    debounce(() => onUpdateFormDesign(formData), 1000);
  };

  useEffect(() => {
    formHook.reset({
      backgroundColor: formDesign.backgroundColor,
      fontColor: formDesign.fontColor,
    });
  }, [formDesign]);

  return (
    <div>
      <Form {...formHook}>
        <form onSubmit={formHook.handleSubmit(onSubmit)} className="space-y-4">
          {basicFields.map((basicField) => (
            <FormField
              key={basicField.fieldName}
              control={formHook.control}
              name={basicField.fieldName}
              render={({ field }) => (
                <FormItem onChange={formHook.handleSubmit(onSubmit)}>
                  <FormLabel>{basicField.fieldLabel}</FormLabel>
                  <div className="flex gap-2 items-center justify-between">
                    <FormControl>
                      <Input
                        type="color"
                        className="max-w-14"
                        {...field}
                        disabled={isSavingFormDesign}
                      />
                    </FormControl>
                    <Input
                      type="text"
                      style={{ color: field.value }}
                      {...field}
                      disabled={isSavingFormDesign}
                    />

                    <span
                      className="text-nowrap ms-4"
                      style={{ color: field.value }}
                    >
                      Example text color
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </form>
      </Form>
    </div>
  );
}
