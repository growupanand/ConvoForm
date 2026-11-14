import {
  getConversationTableData,
  getFlatConversationTableData,
} from "@/components/queryComponents/table/utils";
import { isConversationInProgress } from "@/lib/conversationStatus";
import type { Conversation, FormLabelCategory } from "@convoform/db/src/schema";
import { getVisibleConversationLabels } from "@convoform/db/src/schema/conversations/conversationLabels";
import { useEffect, useMemo, useState } from "react";

export type CsvHeader = {
  label: string;
  key: string;
};

const BASE_CSV_HEADERS: CsvHeader[] = [
  { label: "id", key: "id" },
  { label: "name", key: "name" },
  { label: "createdAt", key: "createdAt" },
  { label: "channelType", key: "channelType" },
  { label: "status", key: "status" },
  { label: "Tone", key: "Tone" },
  { label: "Sentiment", key: "Sentiment" },
  { label: "Lead Temperature", key: "Lead Temperature" },
];

/** Prefix tag columns so ids cannot collide with a form field name. */
function getTagColumnKey(categoryId: string) {
  return `tag:${categoryId}`;
}

export function useTableActions(
  data: Conversation[],
  categories: FormLabelCategory[] = [],
) {
  const [perPage, setPerPage] = useState("10");
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setPageIndex(0);
  }, [perPage]);

  const { tableData, uniqueFormFieldResponsesColumns, csvData, csvHeaders } =
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

        // Data for CSV export (with flattened values). Tag columns are keyed by
        // category id so renaming a tag only changes the display header.
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
              getTagColumnKey(category.id),
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

      const csvHeaders: CsvHeader[] = [
        ...BASE_CSV_HEADERS,
        ...uniqueFormFieldResponsesColumns.map((column) => ({
          label: column,
          key: column,
        })),
        ...categories.map((category) => ({
          label: `Tag: ${category.name}`,
          key: getTagColumnKey(category.id),
        })),
      ];

      return {
        tableData,
        uniqueFormFieldResponsesColumns,
        csvData,
        csvHeaders,
      };
    }, [data, categories]);

  return {
    tableData,
    uniqueFormFieldResponsesColumns,
    csvData,
    csvHeaders,
    perPage,
    setPerPage,
    pageIndex,
    setPageIndex,
  };
}
