"use client";

import { QueryDataCard } from "@/components/queryComponents/dataCard/queryDataCard";
import { api } from "@/trpc/react";

type Props = {
  formId: string;
};

export function OverviewDataCard({ formId }: Readonly<Props>) {
  const query = api.metrics.getConversationMetrics.useQuery({
    formId,
  });
  return <QueryDataCard query={query} title="Conversations" />;
}
