"use client";

import { INPUT_TYPES_MAP, inputTypeEnum } from "@convoform/db/src/schema";
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
import type { UseFormReturn } from "react-hook-form";
import type { FormHookData } from "./useFieldSheet";

type Props = {
  formHook: UseFormReturn<FormHookData>;
  isFormBusy: boolean;
  hasExistingFileUploadField: boolean;
};

export function InputTypeSelector({
  formHook,
  isFormBusy,
  hasExistingFileUploadField,
}: Props) {
  return (
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
                <SelectValue placeholder="Select an input type" />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {inputTypeEnum.options.map((inputType) => {
                const isDisabled =
                  inputType === "fileUpload" && hasExistingFileUploadField;

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
  );
}
