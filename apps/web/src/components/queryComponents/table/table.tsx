import { Alert } from "@convoform/ui";
import { Button } from "@convoform/ui";
import { Skeleton } from "@convoform/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@convoform/ui";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Download } from "lucide-react";
import { CSVLink } from "react-csv";

type FormFieldData = Record<string, string>;
const columnHelper = createColumnHelper<FormFieldData>();

export function TableComponent({
  tableData,
  showExportButton,
  exportFileName,
}: Readonly<{
  tableData: Record<string, string>[];
  showExportButton?: boolean;
  exportFileName?: string;
}>) {
  const tableColumns = Array.from(
    new Set(
      tableData.reduce((acc: string[], row) => {
        return acc.concat(Object.keys(row));
      }, []),
    ),
  );
  const reactTableColumns = tableColumns.map((col) => {
    return columnHelper.accessor(col, {
      cell: (info) => info.getValue(),
    });
  });
  const table = useReactTable<FormFieldData>({
    data: tableData,
    columns: reactTableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      {showExportButton && (
        <div className="flex items-center justify-start py-3">
          <CSVLink data={tableData} filename={exportFileName}>
            <Button size="sm" variant="outline">
              <Download size={20} className="mr-2" /> <span>Export</span>
            </Button>
          </CSVLink>
        </div>
      )}
      <div className="relative max-h-[80vh] overflow-auto rounded-md border bg-white">
        <Table>
          <TableHeader className="sticky top-0 bg-gray-50/90">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-auto py-2 font-bold capitalize"
                  >
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
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

export function TableComponentLoading({ rows = 2 }: { rows?: number }) {
  return (
    <div className="relative max-h-[80vh] overflow-auto rounded-md border bg-white">
      <Table>
        <TableHeader className="sticky top-0 bg-gray-50/90">
          <TableRow>
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint: ignored
              <TableHead key={i} className="h-auto py-2">
                <Skeleton className="h-4 w-full bg-gray-200" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            // biome-ignore lint: ignored
            <TableRow key={i}>
              {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint: ignored
                <TableCell key={i} className="py-2">
                  <Skeleton className="h-4 w-full bg-gray-100" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function TableError({ onRetry }: Readonly<{ onRetry: () => void }>) {
  return (
    <Alert variant="destructive" className="border-none bg-red-50">
      <div className="flex items-center justify-start gap-3">
        <span>Unable to fetch table data</span>
        <Button size="sm" variant="destructive" onClick={() => onRetry()}>
          Retry
        </Button>
      </div>
    </Alert>
  );
}

export function TableEmpty() {
  return <Alert className="border-none bg-gray-50">No data available</Alert>;
}
