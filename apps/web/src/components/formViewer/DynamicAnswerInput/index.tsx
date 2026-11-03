import type {
  ExtraStreamData,
  FieldConfiguration,
} from "@convoform/db/src/schema";
import type { UseConvoFormReturnType } from "@convoform/react";
import dynamic from "next/dynamic";

import { FileUploadInput } from "./fileUploadInput";
import { MultiChoiceInput } from "./multiChoiceInput";
import { RatingInput } from "./ratingInput";
import { TextInput } from "./textInput";

// The date picker pulls chrono-node and react-day-picker. Keep that chunk out
// of the first form load (including the landing demo) until a date field is
// actually active.
const DatePickerInput = dynamic(
  () => import("./datePickerInput").then((module) => module.DatePickerInput),
  {
    ssr: false,
    loading: () => (
      <div aria-hidden="true" className="h-10 w-full rounded-md bg-muted" />
    ),
  },
);

export type InputProps = {
  currentField: ExtraStreamData["currentField"];
  submitAnswer: UseConvoFormReturnType["submitAnswer"];
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
