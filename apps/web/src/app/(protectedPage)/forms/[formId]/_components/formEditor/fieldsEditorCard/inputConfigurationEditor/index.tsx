import { InputTypeSchema } from "@convoform/db/src/schema";
import { UseFormReturn } from "react-hook-form";

import { FormHookData } from "../editFieldSheet";
import { MultiChoiceInputConfiguration } from "./multiChoiceInputConfiguration";
import { TextInputConfigurationEditor } from "./textInputConfigurationEditor";

type Props = {
  inputType: InputTypeSchema;
  formHook: UseFormReturn<FormHookData>;
};

export function InputConfigurationEditor({
  inputType,
  formHook,
}: Readonly<Props>) {
  switch (inputType) {
    case "text":
      return <TextInputConfigurationEditor formHook={formHook} />;
    case "multipleChoice":
      return <MultiChoiceInputConfiguration />;
    default:
      return null;
  }
}
