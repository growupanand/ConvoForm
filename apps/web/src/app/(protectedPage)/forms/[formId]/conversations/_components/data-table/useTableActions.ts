import {
  getConversationTableData,
  getFlatConversationTableData,
} from "@/components/queryComponents/table/utils";
import { isConversationInProgress } from "@/lib/conversationStatus";
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
          channelType,
        } = conversation;
        const sanitizedFormFieldResponses =
          getConversationTableData(formFieldResponses);
        const flattenedFormFieldResponses =
          getFlatConversationTableData(formFieldResponses);
        formFieldResponsesColumns = formFieldResponsesColumns.concat(
          Object.keys(sanitizedFormFieldResponses),
        );
        const status = finishedAt
          ? "Finished"
          : isConversationInProgress(conversation)
            ? "In Progress"
            : "Abandoned";

        // Data for table display (with nested objects for proper rendering)
        tableData.push({
          id,
          name,
          createdAt,
          channelType: channelType ?? "web",
          status,
          ...sanitizedFormFieldResponses,
        });

        // Data for CSV export (with flattened values)
        csvData.push({
          id,
          name,
          createdAt: createdAt.toLocaleString(),
          channelType: channelType ?? "web",
          status,
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
