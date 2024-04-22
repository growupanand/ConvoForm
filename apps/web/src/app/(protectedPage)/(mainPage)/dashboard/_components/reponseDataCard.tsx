"use client";

import { QueryDataCard } from "@/components/queryComponents/dataCard/queryDataCard";
import { api } from "@/trpc/react";

export function ResponseDataCard({ orgId }: { orgId: string }) {
  const query = api.metrics.getConversationMetrics.useQuery({
    organizationId: orgId,
  });

  return <QueryDataCard dataSourceName="Responses" query={query} />;
}
