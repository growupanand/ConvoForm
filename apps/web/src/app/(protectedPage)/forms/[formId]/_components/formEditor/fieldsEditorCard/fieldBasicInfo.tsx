"use client";

import { Info } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@convoform/ui";

import { FieldSectionHeader } from "./fieldSectionHeader";
import type { FormHookData } from "./useFieldSheet";

type Props = {
  formHook: UseFormReturn<FormHookData>;
  isFormBusy: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>;
};

export function FieldBasicInfo({ formHook, isFormBusy, inputRef }: Props) {
  return (
    <div>
      <FieldSectionHeader
        title="Question Configuration"
        description="Configure how the question will appear to users completing your form"
      />
      <div className=" grid space-y-8">
        <FormField
          control={formHook.control}
          name="fieldName"
          render={({ field }) => (
            <FormItem>
              <div className=" flex items-center gap-2">
                <FormLabel>Field name</FormLabel>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start">
                    This field is used for CSV export, as the column name in the
                    table, and as the field name in the form submission page to
                    show current field.
                  </TooltipContent>
                </Tooltip>
              </div>

              <FormControl>
                <Input
                  {...field}
                  placeholder="Human readable name for the field"
                  disabled
                />
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
                    This text will be utilized by the AI to generate questions.
                  </TooltipContent>
                </Tooltip>
              </div>
              <FormControl>
                <Textarea
                  placeholder={
                    "Information you would like to collect (e.g. Tell me your full name, etc.)"
                  }
                  {...field}
                  rows={4}
                  disabled={isFormBusy}
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
