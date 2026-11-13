import {
  getConversationTableData,
  getFlatConversationTableData,
} from "@/components/queryComponents/table/utils";
import { isConversationInProgress } from "@/lib/conversationStatus";
import type { Conversation, FormLabelCategory } from "@convoform/db/src/schema";
import { getVisibleConversationLabels } from "@convoform/db/src/schema/conversations/conversationLabels";
import { useEffect, useMemo, useState } from "react";

export function useTableActions(
  data: Conversation[],
  categories: FormLabelCategory[] = [],
) {
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
          metaData,
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
        const labels = getVisibleConversationLabels(metaData);

        // Data for table display (with nested objects for proper rendering)
        tableData.push({
          id,
          name,
          createdAt,
          channelType: channelType ?? "web",
          status,
          labels,
          ...sanitizedFormFieldResponses,
        });

        // Data for CSV export (with flattened values)
        csvData.push({
          id,
          name,
          createdAt: createdAt.toLocaleString(),
          channelType: channelType ?? "web",
          status,
          Tone: labels.tone?.value ?? "",
          Sentiment: labels.sentiment?.value ?? "",
          "Lead Temperature": labels.temperature?.value ?? "",
          ...Object.fromEntries(
            categories.map((category) => [
              category.name,
              labels.categories.find(
                (label) => label.categoryId === category.id,
              )?.value ?? "",
            ]),
          ),
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
    }, [data, categories]);

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
