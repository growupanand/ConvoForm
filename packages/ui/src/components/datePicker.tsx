"use client";

import { parseDate } from "chrono-node"; // You'll need to install this package
import { CalendarIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { rangeContainsModifiers } from "react-day-picker";
import { cn } from "../lib/utils";
import { TimePicker } from "./timePicker/timePicker";
import { Button } from "./ui/button";
import { Calendar, type CalendarProps } from "./ui/calendar";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type DatePickerProps = CalendarProps & {
  onSelect?: (selectedDate: Date | undefined) => void;
  defaultDate?: Date;
  className?: HTMLDivElement["className"];
  placeholder?: string;
  showTimePicker?: boolean;
};

export function DatePicker({
  onSelect,
  defaultDate,
  className,
  placeholder = "Pick a date",
  showTimePicker = false,
  ...calenderProps
}: DatePickerProps) {
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState<Date | undefined>(defaultDate);
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState("");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use useCallback to ensure function reference stays stable
  const parseInputDate = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      setError(null); // Clear previous errors

      try {
        // Parse natural language date using chrono-node
        const parsedDate = parseDate(text);

        if (parsedDate) {
          // Check if the parsed date is within allowed range
          if (calenderProps.disabled) {
            const matcher = calenderProps.disabled;

            // Create a "range" that's just the single day
            const dateRange = {
              from: new Date(
                parsedDate.getFullYear(),
                parsedDate.getMonth(),
                parsedDate.getDate(),
              ),
              to: new Date(
                parsedDate.getFullYear(),
                parsedDate.getMonth(),
                parsedDate.getDate(),
              ),
            };

            // If the date is in the disabled range, it's invalid
            if (rangeContainsModifiers(dateRange, matcher)) {
              setError("Selected date is not available");
              return false;
            }
          }

          // Date is valid, set it
          setDate(parsedDate);
          return true;
        }

        setError("Couldn't understand that date format");
      } catch (error) {
        console.error("Failed to parse date", error);
        setError("Invalid date format");
      }

      return false;
    },
    [calenderProps.disabled],
  );

  // Ensure cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle debounced input changes
  useEffect(() => {
    // Don't try to parse empty input
    if (!inputText.trim()) return;

    // Clear previous timer if input changes before timeout completes
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      parseInputDate(inputText);
    }, 500);
  }, [inputText, parseInputDate]);

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    setError(null);
    setInputText("");

    // Preserve the time values when selecting a new date
    if (selectedDate && date) {
      // Create a new date with the selected date but keep the existing time
      const newDate = new Date(selectedDate);
      newDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
      setDate(newDate);
    } else {
      setDate(selectedDate);
    }
  };

  // Add a new function to handle confirm button click
  const handleConfirmDate = () => {
    if (date) {
      onSelect?.(date);
      setOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const success = parseInputDate(inputText);
      if (success) {
        setInputText(""); // Clear input after successful parsing
      }
    }
  };

  // Function to update date with time values
  const handleTimeChange = (newDate: Date | undefined) => {
    setDate(newDate);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal overflow-hidden",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            <span>
              {showTimePicker
                ? formatDateTime(date.toISOString())
                : formatDate(date.toISOString())}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto space-y-4">
        <div>
          <Input
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="Type here: today, next week ..."
          />
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
        <Calendar
          {...calenderProps}
          mode="single"
          selected={date}
          onSelect={handleCalendarSelect}
          autoFocus={!showTimePicker || !date}
        />
        {showTimePicker && date && (
          <div className="pt-4 border-t">
            <TimePicker date={date} setDate={handleTimeChange} />
          </div>
        )}
        {date && (
          <Button
            onClick={handleConfirmDate}
            className="w-full"
            disabled={Boolean(error && error.trim() !== "")}
          >
            Confirm Date
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
