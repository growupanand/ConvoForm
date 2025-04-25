import { formatDate, formatDateTime } from "@/lib/utils";
import type { RatingInputConfigSchema } from "@convoform/db/src/schema";
import type {
  CollectedData,
  Conversation,
  DatePickerInputConfigSchema,
} from "@convoform/db/src/schema";
import { Calendar, Clock } from "lucide-react";
import { Star } from "lucide-react"; // Add this import at the top

/**
 * Format conversation fields data for TableComponent,
 * Example: `<TableComponent tableData={tableData} />`
 * @param collectedData
 * @returns
 */

export function getConversationTableData(
  collectedData: Conversation["collectedData"],
) {
  if (!collectedData || !Array.isArray(collectedData)) {
    return {};
  }

  return collectedData.reduce(
    (acc, data) => {
      // Only check if fieldName exists, allow null fieldValues
      if (!data.fieldName) return acc;

      acc[data.fieldName] = {
        value: data.fieldValue || "", // Convert null to empty string
        config: data.fieldConfiguration || {},
      };

      return acc;
    },
    {} as Record<
      string,
      { value: string | null; config: CollectedData["fieldConfiguration"] }
    >,
  );
}

/**
 * Format conversation fields data for Data Tables, flattening values to avoid rendering objects
 * @param collectedData
 * @returns Record with flattened values instead of {value, config} objects
 */
export function getFlatConversationTableData(
  collectedData: Conversation["collectedData"],
): Record<string, string> {
  if (!collectedData || !Array.isArray(collectedData)) {
    return {};
  }

  return collectedData.reduce(
    (acc, data) => {
      if (!data.fieldName) return acc;

      // Store only the value, not the whole object
      const value = data.fieldValue || "";
      const config = data.fieldConfiguration || {};

      // For date fields, format them properly
      if (config.inputType === "datePicker" && value) {
        const includeTime = config.inputConfiguration?.includeTime;
        acc[data.fieldName] = includeTime
          ? formatDateTime(value)
          : formatDate(value);
      } else {
        acc[data.fieldName] = value;
      }

      return acc;
    },
    {} as Record<string, string>,
  );
}

export function renderCellValue(
  value: string,
  fieldConfig?: CollectedData["fieldConfiguration"],
): React.ReactNode {
  // Handle null values
  if (value === null) return "";

  // Return early if no field configuration
  if (!fieldConfig) return value;

  // Handle date fields
  if (isDatePickerField(fieldConfig)) {
    const dateValue = new Date(value);
    if (isValidDateString(value, dateValue)) {
      const { inputConfiguration } = fieldConfig;
      const formattedDate = inputConfiguration?.includeTime
        ? formatDateTime(value)
        : formatDate(value);

      return (
        <div className="flex items-start gap-2 ">
          <span>
            {inputConfiguration?.includeTime ? (
              <Clock className="h-4 w-4 text-muted-foreground inline-block" />
            ) : (
              <Calendar className="h-4 w-4 text-muted-foreground inline-block" />
            )}
          </span>
          <span className="text-justify">{formattedDate}</span>
        </div>
      );
    }
  }

  // Handle rating fields
  if (isRatingField(fieldConfig)) {
    const ratingValue = Number.parseInt(value, 10);
    if (!Number.isNaN(ratingValue)) {
      const maxRating = fieldConfig.inputConfiguration?.maxRating || 5;

      return (
        <div className="flex items-center gap-1">
          {Array.from({ length: maxRating }, (_, i) => (
            <Star
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={i}
              size={16}
              className={
                i < ratingValue
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }
            />
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            ({ratingValue}/{maxRating})
          </span>
        </div>
      );
    }
  }

  return value;
}

// Type guard to check if this is a date picker field
function isDatePickerField(
  config: CollectedData["fieldConfiguration"],
): config is {
  inputType: "datePicker";
  inputConfiguration: DatePickerInputConfigSchema;
} {
  return config?.inputType === "datePicker";
}

// Helper function to validate date strings
function isValidDateString(value: string, dateValue: Date): boolean {
  return (
    !!value &&
    !Number.isNaN(dateValue.getTime()) &&
    typeof value === "string" &&
    value.includes("-")
  );
}

// Add this type guard after the isDatePickerField function
function isRatingField(config: CollectedData["fieldConfiguration"]): config is {
  inputType: "rating";
  inputConfiguration: RatingInputConfigSchema;
} {
  return config?.inputType === "rating";
}
