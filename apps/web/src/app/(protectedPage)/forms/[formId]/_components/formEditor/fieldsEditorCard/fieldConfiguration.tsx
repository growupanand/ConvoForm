"use client";

import type { UseFormReturn } from "react-hook-form";

import type { InputTypeSchema } from "@convoform/db/src/schema";
import { FieldSectionHeader } from "./fieldSectionHeader";
import { InputConfigurationEditor } from "./inputConfigurationEditor";
import { InputTypeSelector } from "./inputTypeSelector";
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
          <InputTypeSelector
            formHook={formHook}
            isFormBusy={isFormBusy}
            hasExistingFileUploadField={hasExistingFileUploadField}
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
