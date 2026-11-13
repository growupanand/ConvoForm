"use client";

import { api } from "@/trpc/react";
import type { Conversation } from "@convoform/db/src/schema";
import { getVisibleConversationLabels } from "@convoform/db/src/schema/conversations/conversationLabels";
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
import { useEffect, useMemo, useState } from "react";
import { TableToolbar } from "./TableToolbar";
import { useConversationColumns } from "./columns";
import { ALL_FILTER_VALUE, ConversationLabelFilters } from "./labelFilters";
import { useTableActions } from "./useTableActions";

export function ConversationsDataTable(props: {
  data: Conversation[];
  formId: string;
}) {
  const { formId, data } = props;
  const [temperatureFilter, setTemperatureFilter] = useState(ALL_FILTER_VALUE);
  const [categoryFilters, setCategoryFilters] = useState<
    Record<string, string>
  >({});

  const { data: form } = api.form.getOne.useQuery({ id: formId });
  const categories = useMemo(
    () =>
      form?.labelSettings?.categoriesEnabled
        ? form.labelSettings.categories
        : [],
    [form?.labelSettings],
  );

  const filteredData = useMemo(() => {
    return data.filter((conversation) => {
      const labels = getVisibleConversationLabels(conversation.metaData);

      if (
        temperatureFilter !== ALL_FILTER_VALUE &&
        labels.temperature?.value !== temperatureFilter
      ) {
        return false;
      }

      return categories.every((category) => {
        const selected = categoryFilters[category.id] ?? ALL_FILTER_VALUE;
        if (selected === ALL_FILTER_VALUE) {
          return true;
        }

        return labels.categories.some(
          (label) =>
            label.categoryId === category.id && label.value === selected,
        );
      });
    });
  }, [data, temperatureFilter, categoryFilters, categories]);

  const {
    tableData,
    uniqueFormFieldResponsesColumns,
    csvData,
    perPage,
    setPerPage,
    pageIndex,
    setPageIndex,
  } = useTableActions(filteredData, categories);

  useEffect(() => {
    setPageIndex(0);
  }, [temperatureFilter, categoryFilters, setPageIndex]);

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
      <ConversationLabelFilters
        categories={categories}
        temperature={temperatureFilter}
        onTemperatureChange={setTemperatureFilter}
        categoryValues={categoryFilters}
        onCategoryChange={(categoryId, value) =>
          setCategoryFilters((current) => ({
            ...current,
            [categoryId]: value,
          }))
        }
        onClear={() => {
          setTemperatureFilter(ALL_FILTER_VALUE);
          setCategoryFilters({});
        }}
      />
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
            {table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No responses match these filters.
                </TableCell>
              </TableRow>
            )}
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
