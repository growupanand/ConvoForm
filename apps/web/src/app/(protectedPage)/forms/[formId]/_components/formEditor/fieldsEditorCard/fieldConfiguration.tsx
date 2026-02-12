"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  Badge,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@convoform/ui";

import {
  INPUT_TYPES_MAP,
  type InputTypeSchema,
  inputTypeEnum,
} from "@convoform/db/src/schema";

import { FieldSectionHeader } from "./fieldSectionHeader";
import { InputConfigurationEditor } from "./inputConfigurationEditor";
import type { FormHookData } from "./useFieldSheet";

type Props = {
  formHook: UseFormReturn<FormHookData>;
  isFormBusy: boolean;
  hasExistingFileUploadField: boolean;
  selectedInputType: InputTypeSchema;
};

export function FieldConfiguration({
  formHook,
  isFormBusy,
  hasExistingFileUploadField,
  selectedInputType,
}: Props) {
  return (
    <div>
      <FieldSectionHeader
        title="Answer Configuration"
        description="Configure how users will provide answers to this question"
      />
      <div className=" grid space-y-8">
        <div className="grid space-y-4">
          <FormField
            control={formHook.control}
            name="fieldConfiguration.inputType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isFormBusy}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a verified email to display" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {inputTypeEnum.options.map((inputType) => {
                      // Disable fileUpload option if one already exists
                      const isDisabled =
                        inputType === "fileUpload" &&
                        hasExistingFileUploadField;

                      return (
                        <SelectItem
                          key={inputType}
                          value={inputType}
                          disabled={isDisabled}
                          className={
                            isDisabled ? "opacity-50 cursor-not-allowed" : ""
                          }
                        >
                          <div>
                            <div>
                              {INPUT_TYPES_MAP[inputType].name}
                              {inputType === "fileUpload" && (
                                <Badge variant="secondary" className="ms-2">
                                  Beta
                                </Badge>
                              )}
                            </div>
                            {isDisabled && (
                              <div className="text-xs">
                                Only one file upload field allowed
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                  <FormMessage />
                </Select>
                <FormDescription className="text-base flex items-center gap-2">
                  {
                    INPUT_TYPES_MAP[field.value as keyof typeof INPUT_TYPES_MAP]
                      .description
                  }
                </FormDescription>
              </FormItem>
            )}
          />

          <InputConfigurationEditor
            inputType={selectedInputType}
            formHook={formHook}
          />
        </div>
      </div>
    </div>
  );
}
