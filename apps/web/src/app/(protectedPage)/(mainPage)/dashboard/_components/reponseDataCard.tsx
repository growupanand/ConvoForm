"use client";

import { CardShell } from "@/components/common/cardShell";
import { QueryDataCard } from "@/components/queryComponents/dataCard/queryDataCard";
import { api } from "@/trpc/react";

export function ResponseDataCard({ orgId }: { orgId: string }) {
  const query = api.metrics.getConversationMetrics.useQuery({
    organizationId: orgId,
  });

  return (
    <CardShell>
      <QueryDataCard title="Responses collected" query={query} />
    </CardShell>
  );
}
