"use client";

import type { Conversation } from "@convoform/db/src/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@convoform/ui";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TableToolbar } from "./TableToolbar";
import { useConversationColumns } from "./columns";
import { useTableActions } from "./useTableActions";

export function ConversationsDataTable(props: {
  data: Conversation[];
  formId: string;
}) {
  const { formId, data } = props;

  const {
    tableData,
    uniqueFormFieldResponsesColumns,
    csvData,
    perPage,
    setPerPage,
    pageIndex,
    setPageIndex,
  } = useTableActions(data);

  const columnDefs = useConversationColumns(
    formId,
    uniqueFormFieldResponsesColumns,
  );

  const table = useReactTable({
    data: tableData,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: pageIndex,
        pageSize: Number(perPage),
      },
    },
  });

  const exportFileName = `Responses ${new Date().toLocaleString()}.csv`;

  return (
    <>
      <TableToolbar
        table={table}
        perPage={perPage}
        setPerPage={setPerPage}
        setPageIndex={setPageIndex}
        csvData={csvData}
        exportFileName={exportFileName}
      />
      <div className="rounded-lg border grow overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background ">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="align-top">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className=" bg-white">
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : ""}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="align-top">
                    {cell.getValue() === ""
                      ? "empty string"
                      : flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
