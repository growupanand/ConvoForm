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

  const exportFileName = `Responses ${new Date().toLocaleString()}.csv`;

  return (
    <QueryTable
      query={query}
      getTableData={(data) => {
        return data.map((item) => {
          // Handled edge case where field value is not string but object
          Object.keys(item.formFieldsData).forEach((key) => {
            const formValue = item.formFieldsData[key];
            if (!formValue) return;
            const valueType = typeof formValue;
            if (valueType !== "string") {
              if (valueType === "object") {
                item.formFieldsData[key] = Object.values(formValue).join(", ");
                return;
              }
              item.formFieldsData[key] = JSON.stringify(formValue);
            }
          });

          return {
            ["Created"]: item.createdAt.toLocaleString(),
            ["Response name"]: item.name,
            ...item.formFieldsData,
          };
        });
      }}
      showExportButton
      exportFileName={exportFileName}
    />
  );
}
