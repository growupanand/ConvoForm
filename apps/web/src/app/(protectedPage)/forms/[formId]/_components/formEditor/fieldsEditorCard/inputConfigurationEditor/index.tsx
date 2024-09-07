import type { InputTypeSchema } from "@convoform/db/src/schema";
import type { UseFormReturn } from "react-hook-form";

import { MutedText } from "@convoform/ui/components/ui/mutedText";
import type { FormHookData } from "../editFieldSheet";
import { DatePickerInputConfiguration } from "./datePickerInputConfiguration";
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
  const renderInputConfiguration = () => {
    switch (inputType) {
      case "text":
        return <TextInputConfigurationEditor formHook={formHook} />;
      case "multipleChoice":
        return <MultiChoiceInputConfiguration formHook={formHook} />;
      case "datePicker":
        return <DatePickerInputConfiguration formHook={formHook} />;
      default:
        return null;
    }
  };

  return (
    <InputConfigurationEditorWraper>
      {renderInputConfiguration()}
    </InputConfigurationEditorWraper>
  );
}

function InputConfigurationEditorWraper({
  children,
}: { children: React.ReactNode }) {
  return <div className="grid space-y-4 pt-4">{children}</div>;
}

export function OptionalText() {
  return <MutedText>(optional)</MutedText>;
}
