"use client";

import { QueryTable } from "@/components/common/table/queryTable";
import { api } from "@/trpc/react";

type Props = {
  formId: string;
};

export function OverviewTable({ formId }: Readonly<Props>) {
  const query = api.conversation.getFormResponsesData.useQuery({
    formId,
  });

  return (
    <QueryTable
      query={query}
      getTableData={(data) => {
        return data.map((item) => ({
          ["Created"]: item.createdAt.toLocaleString(),
          ["Response name"]: item.name,
          ...item.formFieldsData,
        }));
      }}
    />
  );
}
