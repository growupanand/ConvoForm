"use client";

import {
  type DatePickerInputConfigSchema,
  restoreDateFields,
} from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";
import { Calendar, type Matcher } from "@convoform/ui/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@convoform/ui/components/ui/popover";
import { cn } from "@convoform/ui/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { InputProps } from ".";

type Props = InputProps & {
  inputConfiguration: DatePickerInputConfigSchema;
};

export function DatePicker({
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
  const [open, setOpen] = useState(false);

  const handleOnSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);

    if (!selectedDate) {
      return;
    }

    submitAnswer(selectedDate.toDateString());
  };

  return (
    <Popover onOpenChange={setOpen} open={open} modal>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? date.toDateString() : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleOnSelect}
          disabled={getDateSelectorRules()}
          initialFocus
          required
        />
      </PopoverContent>
    </Popover>
  );
}
