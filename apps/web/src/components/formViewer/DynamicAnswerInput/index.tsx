import type {
  ExtraStreamData,
  FieldConfiguration,
} from "@convoform/db/src/schema";
import type { SubmitAnswer } from "@convoform/react";

import { DatePicker } from "./datePicker";
import { MultiChoiceInput } from "./multiChoiceInput";
import { TextInput } from "./textInput";

export type InputProps = {
  currentField: ExtraStreamData["currentField"];
  submitAnswer: SubmitAnswer;
};

type Props = InputProps & {
  fieldConfiguration: FieldConfiguration;
};

export function DynamicAnswerInput({
  fieldConfiguration,
  ...inputProps
}: Readonly<Props>) {
  switch (fieldConfiguration.inputType) {
    case "text":
      return (
        <TextInput
          inputConfiguration={fieldConfiguration.inputConfiguration}
          {...inputProps}
        />
      );

    case "multipleChoice":
      return (
        <MultiChoiceInput
          inputConfiguration={fieldConfiguration.inputConfiguration}
          {...inputProps}
        />
      );

    case "datePicker":
      return (
        <DatePicker
          inputConfiguration={fieldConfiguration.inputConfiguration}
          {...inputProps}
        />
      );

    default:
      return null;
  }
}
