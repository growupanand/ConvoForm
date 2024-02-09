"use client";

import { timeAgo } from "@/lib/utils";
import { api } from "@/trpc/react";
import { DataCard } from "./dataCard";
import { DataCardSkeleton } from "./dataCardLoading";

export function ResponseDataCard({ orgId }: { orgId: string }) {
  const { data, isLoading } = api.metrics.getConversationMetrics.useQuery({
    organizationId: orgId,
    lastDaysCount: 7,
  });

  if (isLoading) {
    return <DataCardSkeleton />;
  }

  if (!data) {
    return null;
  }

  return (
    <DataCard
      title="Responses"
      mainValue={data.totalCount.toString()}
      secondaryValue={
        data.lastConversationCreatedAt
          ? `Last ${timeAgo(data.lastConversationCreatedAt)}`
          : undefined
      }
      dataType="Total"
      chartData={data.data}
    />
  );
}
