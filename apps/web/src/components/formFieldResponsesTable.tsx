import {
  getConversationTableData,
  renderCellValue,
} from "@/components/queryComponents/table/utils";
import { cn } from "@/lib/utils";
import type { Conversation } from "@convoform/db/src/schema";

import { Skeleton } from "@convoform/ui";
import { Table, TableBody, TableCell, TableRow } from "@convoform/ui";
type Props = {
  formFieldResponses: Conversation["formFieldResponses"];
};

export function FormFieldResponsesTable({
  formFieldResponses,
}: Readonly<Props>) {
  const tableData = getConversationTableData(formFieldResponses);
  const tableColumns = Object.keys(tableData);

  return (
    <Table className="text-base">
      <TableBody>
        {tableColumns.map((columnName, index) => {
          const value = tableData[columnName]?.value ?? "";
          const fieldConfig = tableData[columnName]?.config;
          return (
            <TableRow
              key={`${index}-${columnName}-${value}`}
              className="grid grid-cols-2 gap-4 w-full"
            >
              <FormFieldResponsesTableCell className="text-subtle-foreground">
                {columnName}
              </FormFieldResponsesTableCell>
              <FormFieldResponsesTableCell className="font-medium">
                {renderCellValue(value, fieldConfig)}
              </FormFieldResponsesTableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

FormFieldResponsesTable.Skeleton = ({
  rowsCount = 3,
}: { rowsCount?: number }) => {
  return (
    <Table className="">
      <TableBody>
        {Array.from({ length: rowsCount }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <TableRow key={index}>
            <FormFieldResponsesTableCell>
              <Skeleton className="h-4 w-full bg-gray-200" />
            </FormFieldResponsesTableCell>
            <FormFieldResponsesTableCell>
              <Skeleton className="h-4 w-full" />
            </FormFieldResponsesTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

function FormFieldResponsesTableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: HTMLTableCellElement["className"];
}) {
  return (
    <TableCell
      className={cn(
        "py-2 align-text-top whitespace-pre-line text-justify break-words font-normal",
        className,
      )}
    >
      {children}
    </TableCell>
  );
}
