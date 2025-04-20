"use client";
import {
  type DatePickerInputConfigSchema,
  restoreDateFields,
} from "@convoform/db/src/schema";
import { DatePicker } from "@convoform/ui";
import type { Matcher } from "@convoform/ui";
import { useState } from "react";
import type { InputProps } from ".";

type Props = InputProps & {
  inputConfiguration: DatePickerInputConfigSchema;
};

export function DatePickerInput({
  submitAnswer,
  inputConfiguration,
}: Readonly<Props>) {
  const { inputConfiguration: parsedInputConfiguration } = restoreDateFields({
    inputConfiguration,
    inputType: "datePicker",
  });

  const { minDate, maxDate } =
    parsedInputConfiguration as DatePickerInputConfigSchema;

  const getDateSelectorRules = () => {
    if (!minDate && !maxDate) {
      return undefined;
    }

    const rules: Record<string, Date> = {};

    if (minDate) {
      rules.before = minDate;
    }

    if (maxDate) {
      rules.after = maxDate;
    }

    return rules as Matcher;
  };

  const [date, setDate] = useState<Date>();

  const handleOnSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);

    if (!selectedDate) {
      return;
    }

    submitAnswer(selectedDate.toISOString());
  };

  return (
    <DatePicker
      mode="single"
      selected={date}
      onSelect={handleOnSelect}
      disabled={getDateSelectorRules()}
      autoFocus
      required
      className="lg:max-w-[280px]"
      showTimePicker={inputConfiguration.includeTime}
    />
  );
}
