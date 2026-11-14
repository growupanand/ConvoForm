"use client";

import type { FormLabelCategory } from "@convoform/db/src/schema";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@convoform/ui";
import { Filter, X } from "lucide-react";

export const ALL_FILTER_VALUE = "all";

type Props = {
  categories: FormLabelCategory[];
  temperature: string;
  onTemperatureChange: (value: string) => void;
  categoryValues: Record<string, string>;
  onCategoryChange: (categoryId: string, value: string) => void;
  onClear: () => void;
};

export function ConversationLabelFilters({
  categories,
  temperature,
  onTemperatureChange,
  categoryValues,
  onCategoryChange,
  onClear,
}: Props) {
  const hasActiveFilters =
    temperature !== ALL_FILTER_VALUE ||
    categories.some(
      (category) =>
        (categoryValues[category.id] ?? ALL_FILTER_VALUE) !== ALL_FILTER_VALUE,
    );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Filter className="size-3.5" />
        Filter
      </span>

      <Select value={temperature} onValueChange={onTemperatureChange}>
        <SelectTrigger
          className="h-9 w-[170px]"
          aria-label="Filter by lead temperature"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value={ALL_FILTER_VALUE}>All temperatures</SelectItem>
          <SelectItem value="Hot">Hot</SelectItem>
          <SelectItem value="Warm">Warm</SelectItem>
          <SelectItem value="Cold">Cold</SelectItem>
        </SelectContent>
      </Select>

      {categories.map((category) => (
        <Select
          key={category.id}
          value={categoryValues[category.id] ?? ALL_FILTER_VALUE}
          onValueChange={(value) => onCategoryChange(category.id, value)}
        >
          <SelectTrigger
            className="h-9 w-[180px]"
            aria-label={`Filter by ${category.name}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value={ALL_FILTER_VALUE}>
              All {category.name.toLowerCase()}
            </SelectItem>
            {category.options.map((option) => (
              <SelectItem key={option} value={option}>
                {category.name}: {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {hasActiveFilters && (
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          <X className="mr-1.5 size-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
