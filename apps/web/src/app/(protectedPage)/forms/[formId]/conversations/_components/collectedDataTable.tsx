import { getConversationTableData } from "@/components/queryComponents/table/utils";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import type {
  CollectedData,
  Conversation,
  DatePickerInputConfigSchema,
} from "@convoform/db/src/schema";

import { Skeleton } from "@convoform/ui";
import { Table, TableBody, TableCell, TableRow } from "@convoform/ui";
import { Calendar, Clock } from "lucide-react";
type Props = {
  collectedData: Conversation["collectedData"];
};

export function CollectedDataTable({ collectedData }: Readonly<Props>) {
  const tableData = getConversationTableData(collectedData);
  const tableColumns = Object.keys(tableData);

  return (
    <Table>
      <TableBody>
        {tableColumns.map((columnName, index) => {
          const value = tableData[columnName]?.value ?? "";
          const fieldConfig = tableData[columnName]?.config;
          return (
            <TableRow key={`${index}-${columnName}-${value}`}>
              <CollectedDataTableCell className="text-muted-foreground">
                {columnName}
              </CollectedDataTableCell>
              <CollectedDataTableCell>
                {renderCellValue(value, fieldConfig)}
              </CollectedDataTableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

CollectedDataTable.Skeleton = ({ rowsCount = 3 }: { rowsCount?: number }) => {
  return (
    <Table className="">
      <TableBody>
        {Array.from({ length: rowsCount }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <TableRow key={index}>
            <CollectedDataTableCell>
              <Skeleton className="h-4 w-full" />
            </CollectedDataTableCell>
            <CollectedDataTableCell>
              <Skeleton className="h-4 w-full" />
            </CollectedDataTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

function CollectedDataTableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: HTMLTableCellElement["className"];
}) {
  return (
    <TableCell
      className={cn(
        "py-2 font-medium align-text-top whitespace-pre-line text-justify",
        className,
      )}
    >
      {children}
    </TableCell>
  );
}

function renderCellValue(
  value: string,
  fieldConfig?: CollectedData["fieldConfiguration"],
): React.ReactNode {
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
