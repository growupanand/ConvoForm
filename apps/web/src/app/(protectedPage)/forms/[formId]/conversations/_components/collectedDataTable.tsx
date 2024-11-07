import { getConversationTableData } from "@/components/queryComponents/table/utils";
import type { Conversation } from "@convoform/db/src/schema";

import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@convoform/ui/components/ui/table";
type Props = {
  collectedData: Conversation["collectedData"];
};

export function CollectedDataTable({ collectedData }: Readonly<Props>) {
  const tableData = getConversationTableData(collectedData);
  const tableColumns = Object.keys(tableData);

  return (
    <div className="overflow-hidden rounded-md border bg-white">
      <Table className="">
        <TableBody>
          {tableColumns.map((columnName, index) => {
            const value = tableData[columnName];
            return (
              <TableRow key={`${index}-${columnName}-${value}`}>
                <TableCell className="py-2 align-text-top whitespace-pre-line text-justify">
                  {columnName}
                </TableCell>
                <TableCell className="py-2 font-medium align-text-top whitespace-pre-line text-justify">
                  {tableData[columnName]}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

const CollectedDataTableSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-md border bg-white">
      <Table className="">
        <TableBody>
          <TableRow>
            <TableCell className="py-2">
              <Skeleton className="h-4 w-full" />
            </TableCell>
            <TableCell className="py-2 font-medium">
              <Skeleton className="h-4 w-full" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

CollectedDataTable.Skeleton = CollectedDataTableSkeleton;
