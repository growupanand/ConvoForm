import type {
  ExtraStreamData,
  FieldConfiguration,
} from "@convoform/db/src/schema";
import type { SubmitAnswer } from "@convoform/react";

import { DatePickerInput } from "./datePickerInput";
import { FileUploadInput } from "./fileUploadInput";
import { MultiChoiceInput } from "./multiChoiceInput";
import { RatingInput } from "./ratingInput";
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
        <DatePickerInput
          inputConfiguration={fieldConfiguration.inputConfiguration}
          {...inputProps}
        />
      );

    case "rating":
      return (
        <RatingInput
          inputConfiguration={fieldConfiguration.inputConfiguration}
          {...inputProps}
        />
      );

    case "fileUpload":
      return (
        <FileUploadInput
          inputConfiguration={fieldConfiguration.inputConfiguration}
          {...inputProps}
        />
      );

    default:
      return null;
  }
}
