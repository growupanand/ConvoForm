"use client";

import { getConversationTableData } from "@/components/queryComponents/table/utils";
import { timeAgo } from "@/lib/utils";
import type { Conversation } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@convoform/ui/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@convoform/ui/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@convoform/ui/components/ui/tooltip";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";
import { Link } from "next-view-transitions";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CSVLink } from "react-csv";

type ConversationData = Pick<
  Conversation,
  "id" | "name" | "createdAt" | "isFinished" | "isInProgress"
>;

type ConversationTableData = Omit<
  ConversationData,
  "isFinished" | "isInProgress"
> & {
  status: string;
};

export function ConversationsDataTable({ data }: { data: Conversation[] }) {
  const { formId } = useParams();
  const [perPage, setPerPage] = useState("10");
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setPageIndex(0);
  }, [perPage]);

  const exportFileName = `Responses ${new Date().toLocaleString()}.csv`;

  const { tableData, uniqueCollectedDataColumns } = useMemo(() => {
    let collectedDataColumns = [] as string[];
    const tableData = [];

    for (const conversation of data) {
      const { collectedData, id, name, createdAt, isFinished, isInProgress } =
        conversation;
      const sanitizedCollectedData = getConversationTableData(collectedData);
      collectedDataColumns = collectedDataColumns.concat(
        Object.keys(sanitizedCollectedData),
      );

      tableData.push({
        id,
        name,
        createdAt,
        status: isFinished
          ? "Finished"
          : isInProgress
            ? "In Progress"
            : "Not Started",
        ...sanitizedCollectedData,
      });
    }

    const uniqueCollectedDataColumns = Array.from(
      new Set(collectedDataColumns),
    );

    return {
      tableData,
      uniqueCollectedDataColumns,
    };
  }, [data]);

  const baseColumnsDefs: ColumnDef<ConversationTableData>[] = [
    {
      accessorKey: "name",
      header: "Conversation Name",
      cell: (info) => (
        <span>
          <Button
            variant="link"
            size="sm"
            className="font-medium h-auto"
            asChild
          >
            <Link
              href={`/forms/${formId}/conversations/${info.row.original.id}`}
            >
              <FileText className="size-4 me-2 " />
              <span>{info.row.original.name}</span>
            </Link>
          </Button>
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Submitted At",
      cell: (info) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-muted-foreground ">
              {timeAgo(info.row.original.createdAt)}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{info.row.original.createdAt.toLocaleString()}</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];

  const uniqueCollectedDataColumnsDefs: ColumnDef<ConversationTableData>[] =
    uniqueCollectedDataColumns.map((column) => {
      return {
        accessorKey: column,
        header: column,
        cell: (info) => (
          <div className="min-w-[50px] max-w-[200px]">
            {info.getValue() as string}
          </div>
        ),
      };
    });

  const columnDefs = [...baseColumnsDefs, ...uniqueCollectedDataColumnsDefs];

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

  return (
    <div className="pb-10 ">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center justify-end gap-4 text-sm">
          <Select defaultValue={perPage} onValueChange={setPerPage}>
            <SelectTrigger className="gap-1 font-semibold">
              <SelectValue placeholder="Select a page size" />
              <span className="text-nowrap text-muted-foreground">
                per page
              </span>
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="40">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="px-2"
              onClick={() =>
                setPageIndex(table.getState().pagination.pageIndex - 1)
              }
              disabled={table.getState().pagination.pageIndex === 0}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-nowrap">
              Page{" "}
              <span className="font-semibold">
                {table.getState().pagination.pageIndex + 1}
              </span>{" "}
              of {table.getPageCount()}
            </span>

            <Button
              variant="outline"
              size="sm"
              className="px-2"
              onClick={() =>
                setPageIndex(table.getState().pagination.pageIndex + 1)
              }
              disabled={
                table.getState().pagination.pageIndex >=
                table.getPageCount() - 1
              }
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <CSVLink data={tableData} filename={exportFileName}>
          <Button size="sm" variant="ghost">
            <Download size={20} className="mr-2" /> <span>Export CSV</span>
          </Button>
        </CSVLink>
      </div>
      <div className=" rounded-md border max-h-[calc(100vh-250px)] overflow-y-scroll relative">
        <Table className="">
          <TableHeader className="sticky top-0 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10">
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
