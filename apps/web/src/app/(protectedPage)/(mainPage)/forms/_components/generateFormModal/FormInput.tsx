"use client";

import { useAutoHeightHook } from "@/hooks/auto-height-hook";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@convoform/ui";
import { Textarea } from "@convoform/ui";
import type { UseFormReturn } from "react-hook-form";

type FormInputData = {
  formOverview: string;
};

type FormInputProps = {
  form: UseFormReturn<FormInputData>;
  characterCount: number;
};

export function FormInput({ form, characterCount }: FormInputProps) {
  const formOverview = form.watch("formOverview");
  const { inputRef } = useAutoHeightHook({ value: formOverview });

  return (
    <FormField
      control={form.control}
      name="formOverview"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-medium">
            Describe Your Form
          </FormLabel>
          <FormDescription>
            Provide a detailed description of the form you want to create. The
            AI will generate appropriate fields based on your description.
          </FormDescription>
          <FormControl>
            <div className="space-y-2">
              <Textarea
                {...field}
                maxLength={500}
                rows={6}
                className="overflow-hidden resize-none"
                placeholder="Example: I want to create a customer feedback form for my restaurant. It should collect customer name, email, rating for food quality, service quality, and overall experience, plus a text field for additional comments."
                ref={(e) => {
                  field.ref(e);
                  inputRef.current = e;
                }}
              />
              <div className="flex justify-between items-center text-xs">
                <FormMessage />
                <div
                  className={`transition-colors ${
                    characterCount < 50
                      ? "text-red-500"
                      : characterCount > 450
                        ? "text-amber-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {characterCount}/500 characters
                  {characterCount < 50 && (
                    <span className="ml-1 text-red-500">
                      (minimum 50 required)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
