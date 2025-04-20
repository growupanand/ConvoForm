"use client";

import  { useCallback, useEffect, useRef, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { parseDate } from "chrono-node"; // You'll need to install this package
import { cn } from "../lib/utils";
import {Input} from "./ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover";
import {Button} from "./ui/button";
import {Calendar, CalendarProps} from "./ui/calendar";


type DatePickerProps = CalendarProps & {
  onSelect?: (selectedDate: Date | undefined) => void;
  defaultDate?: Date;
  className?: HTMLDivElement["className"];
  placeholder?: string;
}

export function DatePicker({
  onSelect,
  defaultDate,
  className,
  placeholder = "Pick a date",
  ...calenderProps
}: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(defaultDate);
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState("");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use useCallback to ensure function reference stays stable
  const parseInputDate = useCallback((text: string) => {
    if (!text.trim()) return;
    
    try {
      // Parse natural language date using chrono-node
      const parsedDate = parseDate(text);
      
      if (parsedDate) {
        setDate(parsedDate);
        onSelect?.(parsedDate);
        return true;
      }
    } catch (error) {
      console.error("Failed to parse date", error);
    }
    
    return false;
  }, [onSelect]);

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
    setDate(selectedDate);
    onSelect?.(selectedDate);
    setOpen(false);
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal overflow-hidden",
          !date && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? date.toDateString() : <span>{placeholder}</span>}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto space-y-4">
        <Input
        value={inputText}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder="Type here: today, next week ..."
      />
      <Calendar
        {...calenderProps}
        mode="single"
        selected={date}
        onSelect={handleCalendarSelect}
        autoFocus
      />
    </PopoverContent>
  </Popover>
  );
}