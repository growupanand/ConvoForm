"use client";

import { QueryTable } from "@/components/queryComponents/table/queryTable";
import { api } from "@/trpc/react";
import { ConversationsTable } from "./data-table/conversationsTable";

type Props = {
  formId: string;
};

export function AllConversationsTable({ formId }: Readonly<Props>) {
  const query = api.conversation.getFormResponsesData.useQuery({
    formId,
  });

  return (
    <QueryTable
      query={query}
      successComponent={(data) => (
        <ConversationsTable
          data={data.map((item) => ({
            ...item,
            transcript: item.transcript || [],
          }))}
        />
      )}
      loadingComponent={<ConversationsTable.Skeleton />}
      emptyComponent={<ConversationsTable.Empty formId={formId} />}
    />
  );
}
