import { Button } from "@convoform/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@convoform/ui";
import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { CSVLink } from "react-csv";

interface TableToolbarProps<TData> {
  table: Table<TData>;
  perPage: string;
  setPerPage: (value: string) => void;
  setPageIndex: (index: number) => void;
  csvData: any[];
  exportFileName: string;
}

export function TableToolbar<TData>({
  table,
  perPage,
  setPerPage,
  setPageIndex,
  csvData,
  exportFileName,
}: TableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-end gap-4 text-sm">
        <Select defaultValue={perPage} onValueChange={setPerPage}>
          <SelectTrigger className="gap-1 font-semibold">
            <SelectValue placeholder="Select a page size" />
            <span className="text-nowrap text-muted-foreground">per page</span>
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
            disabled={!table.getCanPreviousPage()}
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
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <CSVLink data={csvData} filename={exportFileName}>
        <Button size="sm" variant="ghost">
          <Download size={20} className="mr-2" /> <span>Export CSV</span>
        </Button>
      </CSVLink>
    </div>
  );
}
