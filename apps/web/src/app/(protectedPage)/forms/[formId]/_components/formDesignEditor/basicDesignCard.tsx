"use client";

import { ToggleButton } from "@/components/common/toggleButton";
import { debounce } from "@/lib/utils";
import {
  type FormDesignRenderSchema,
  patchFormDesignSchema,
} from "@convoform/db/src/schema";
import {
  FORM_SECTIONS_ENUMS,
  type FormSections,
} from "@convoform/db/src/schema/formDesigns/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@convoform/ui";
import { Input } from "@convoform/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type Props = {
  formDesign: FormHookData;
  onUpdateFormDesign: (updatedFormDesign: FormHookData) => void;
  isSavingFormDesign: boolean;
  currentSection: FormSections;
  defaultFormDesign: FormDesignRenderSchema;
};

const formHookSchema = patchFormDesignSchema
  .pick({
    backgroundColor: true,
    fontColor: true,
    useDefaultDesign: true,
  })
  .required();
export type FormHookData = z.infer<typeof formHookSchema>;

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

export function BasicDesignCard({
  formDesign,
  onUpdateFormDesign,
  isSavingFormDesign,
  currentSection,
  defaultFormDesign,
}: Readonly<Props>) {
  const useDefaultDesign = formDesign.useDefaultDesign;
  const isDefaultScreen = currentSection === FORM_SECTIONS_ENUMS.defaultScreen;

  const shouldDisableInput =
    isSavingFormDesign || (!isDefaultScreen && useDefaultDesign);

  const formHook = useForm<FormHookData>({
    defaultValues: {
      backgroundColor: formDesign.backgroundColor,
      fontColor: formDesign.fontColor,
      useDefaultDesign: formDesign.useDefaultDesign,
    },
    resolver: zodResolver(formHookSchema),
    mode: "onChange",
  });

  const useDefaultColors = formHook.watch("useDefaultDesign");

  const onSubmit = (formData: FormHookData) => {
    debounce(() => {
      onUpdateFormDesign(formData);
    }, 1000);
  };

  useEffect(() => {
    formHook.reset({
      backgroundColor: formDesign.backgroundColor,
      fontColor: formDesign.fontColor,
      useDefaultDesign: formDesign.useDefaultDesign,
    });
  }, [formDesign]);

  return (
    <div>
      <Form {...formHook}>
        <form onSubmit={formHook.handleSubmit(onSubmit)} className="space-y-4">
          {(!useDefaultColors || isDefaultScreen) &&
            basicFields.map((basicField) => (
              <FormField
                key={basicField.fieldName}
                control={formHook.control}
                name={basicField.fieldName}
                render={({ field }) => {
                  // Because if user selected use default design, we want to show the default color in form
                  const fieldValue = useDefaultDesign
                    ? defaultFormDesign[basicField.fieldName]
                    : field.value;

                  return (
                    <FormItem onChange={formHook.handleSubmit(onSubmit)}>
                      <FormLabel>{basicField.fieldLabel}</FormLabel>
                      <div className="flex gap-2 items-center justify-between">
                        <FormControl>
                          <Input
                            type="color"
                            className="max-w-14"
                            {...field}
                            value={fieldValue}
                            disabled={shouldDisableInput}
                          />
                        </FormControl>
                        <Input
                          type="text"
                          style={{
                            color: fieldValue,
                          }}
                          {...field}
                          value={fieldValue}
                          disabled={shouldDisableInput}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            ))}
          {currentSection !== FORM_SECTIONS_ENUMS.defaultScreen && (
            <FormField
              control={formHook.control}
              name="useDefaultDesign"
              render={({ field }) => {
                return (
                  <FormItem>
                    <ToggleButton
                      className=" "
                      label="Default theme"
                      id="useDefaultDesign"
                      description="Applies default theme (configurable in default screen)"
                      switchProps={{
                        checked: field.value,
                        onCheckedChange: (v) => {
                          field.onChange(v);
                          formHook.handleSubmit(onSubmit)();
                        },
                        disabled: isSavingFormDesign,
                      }}
                    />
                  </FormItem>
                );
              }}
            />
          )}
        </form>
      </Form>
    </div>
  );
}
