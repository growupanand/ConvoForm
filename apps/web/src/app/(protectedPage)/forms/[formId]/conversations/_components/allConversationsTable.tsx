"use client";

import { QueryTable } from "@/components/queryComponents/table/queryTable";
import { getConversationTableData } from "@/components/queryComponents/table/utils";
import { api } from "@/trpc/react";

type Props = {
  formId: string;
};

export function AllConversationsTable({ formId }: Readonly<Props>) {
  const query = api.conversation.getFormResponsesData.useQuery({
    formId,
  });

  const exportFileName = `Responses ${new Date().toLocaleString()}.csv`;

  return (
    <QueryTable
      query={query}
      getTableData={(data) => {
        return data.map((item) => {
          const tableData = getConversationTableData(item.fieldsData);
          return {
            ["Created"]: item.createdAt.toLocaleString(),
            ["Response name"]: item.name,
            ...tableData,
          };
        });
      }}
      showExportButton
      exportFileName={exportFileName}
    />
  );
}
