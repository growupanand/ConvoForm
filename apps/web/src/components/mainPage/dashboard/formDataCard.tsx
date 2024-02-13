"use client";

import { QueryDataCard } from "@/components/common/dataCard/queryDataCard";
import { api } from "@/trpc/react";

export function FormDataCard({ orgId }: { orgId: string }) {
  const query = api.metrics.getFormMetrics.useQuery({
    organizationId: orgId,
  });

  return <QueryDataCard query={query} dataSourceName="Forms" />;
}
