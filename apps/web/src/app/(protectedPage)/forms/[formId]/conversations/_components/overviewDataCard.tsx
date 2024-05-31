"use client";

import { CardShell } from "@/components/common/cardShell";
import { QueryDataCard } from "@/components/queryComponents/dataCard/queryDataCard";
import { api } from "@/trpc/react";

type Props = {
  formId: string;
};

export function OverviewDataCard({ formId }: Readonly<Props>) {
  const query = api.metrics.getConversationMetrics.useQuery({
    formId,
  });
  return (
    <CardShell>
      <QueryDataCard query={query} title="Conversations" />
    </CardShell>
  );
}
