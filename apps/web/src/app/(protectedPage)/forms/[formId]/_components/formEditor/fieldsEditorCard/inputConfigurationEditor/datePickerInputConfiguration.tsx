"use client";

import type { UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button, FormMessage, Switch } from "@convoform/ui";
import { Calendar } from "@convoform/ui";
import { FormControl, FormField, FormItem, FormLabel } from "@convoform/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@convoform/ui";
import { CalendarIcon, Clock } from "lucide-react";
import { useState } from "react";
import { OptionalText } from ".";
import type { FormHookData } from "../editFieldSheet";

type Props = {
  formHook: UseFormReturn<FormHookData>;
};

export function DatePickerInputConfiguration({ formHook }: Readonly<Props>) {
  return (
    <>
      <FormField
        control={formHook.control}
        name="fieldConfiguration.inputConfiguration.includeTime"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between py-2">
            <FormLabel className="font-normal text-sm flex items-center cursor-pointer">
              <Clock className="size-4 inline me-2" /> Include time
            </FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={formHook.control}
        name="fieldConfiguration.inputConfiguration.minDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Minimum Date <OptionalText />
            </FormLabel>
            <FormControl>
              <DatePicker
                defaultDate={field.value}
                onDateSelect={(date) => field.onChange(date)}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={formHook.control}
        name="fieldConfiguration.inputConfiguration.maxDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Maximum Date <OptionalText />
            </FormLabel>
            <FormControl>
              <DatePicker
                defaultDate={field.value}
                onDateSelect={(date) => field.onChange(date)}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}

function DatePicker({
  onDateSelect,
  defaultDate,
}: { onDateSelect?: (date?: Date) => void; defaultDate?: Date }) {
  const [date, setDate] = useState<Date | undefined>(defaultDate);
  const [open, setOpen] = useState(false);

  const handleOnSelect = (selectedDate?: Date) => {
    setDate(selectedDate);
    onDateSelect?.(selectedDate);
    setOpen(false);
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
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
