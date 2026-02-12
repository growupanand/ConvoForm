import {
  getConversationTableData,
  getFlatConversationTableData,
} from "@/components/queryComponents/table/utils";
import type { Conversation } from "@convoform/db/src/schema";
import { useEffect, useMemo, useState } from "react";

export function useTableActions(data: Conversation[]) {
  const [perPage, setPerPage] = useState("10");
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setPageIndex(0);
  }, [perPage]);

  const { tableData, uniqueFormFieldResponsesColumns, csvData } =
    useMemo(() => {
      let formFieldResponsesColumns = [] as string[];
      const tableData = [];
      const csvData = [];

      for (const conversation of data) {
        const {
          formFieldResponses,
          id,
          name,
          createdAt,
          finishedAt,
          isInProgress,
        } = conversation;
        const sanitizedFormFieldResponses =
          getConversationTableData(formFieldResponses);
        const flattenedFormFieldResponses =
          getFlatConversationTableData(formFieldResponses);
        formFieldResponsesColumns = formFieldResponsesColumns.concat(
          Object.keys(sanitizedFormFieldResponses),
        );

        // Data for table display (with nested objects for proper rendering)
        tableData.push({
          id,
          name,
          createdAt,
          status: finishedAt
            ? "Finished"
            : isInProgress
              ? "In Progress"
              : "Not Started",
          ...sanitizedFormFieldResponses,
        });

        // Data for CSV export (with flattened values)
        csvData.push({
          id,
          name,
          createdAt: createdAt.toLocaleString(),
          status: finishedAt
            ? "Finished"
            : isInProgress
              ? "In Progress"
              : "Not Started",
          ...flattenedFormFieldResponses,
        });
      }

      const uniqueFormFieldResponsesColumns = Array.from(
        new Set(formFieldResponsesColumns),
      );

      return {
        tableData,
        uniqueFormFieldResponsesColumns,
        csvData,
      };
    }, [data]);

  return {
    tableData,
    uniqueFormFieldResponsesColumns,
    csvData,
    perPage,
    setPerPage,
    pageIndex,
    setPageIndex,
  };
}
