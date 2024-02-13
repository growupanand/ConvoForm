"use client";

import { QueryDataCard } from "@/components/common/dataCard/queryDataCard";
import { api } from "@/trpc/react";

type Props = {
  orgId: string;
  formId: string;
};

export function OverviewDataCard({ orgId, formId }: Readonly<Props>) {
  const query = api.metrics.getConversationMetrics.useQuery({
    organizationId: orgId,
    formId,
  });
  return <QueryDataCard query={query} dataSourceName="Responses Overview" />;
}
