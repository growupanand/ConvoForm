"use client";

import { timeAgo } from "@/lib/utils";
import { api } from "@/trpc/react";
import { DataCard } from "./dataCard";
import { DataCardSkeleton } from "./dataCardLoading";

export function FormDataCard({ orgId }: { orgId: string }) {
  const { data, isLoading } = api.metrics.getFormMetrics.useQuery({
    organizationId: orgId,
    lastDaysCount: 7,
  });

  if (isLoading) {
    return <DataCardSkeleton />;
  }

  if (!data || !data.totalCount) {
    return null;
  }

  return (
    <DataCard
      title="Forms"
      mainValue={data.totalCount.toString()}
      secondaryValue={
        data.lastFormCreatedAt
          ? `Last ${timeAgo(data.lastFormCreatedAt)}`
          : undefined
      }
      dataType="Total"
      chartData={data.data}
    />
  );
}
