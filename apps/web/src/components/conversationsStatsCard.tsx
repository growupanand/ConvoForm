"use client";

import { StatsCard } from "@/components/common/statsCard";
import { QueryComponent } from "@/components/queryComponents/queryComponent";
import { api } from "@/trpc/react";

import { Skeleton } from "@convoform/ui/components/ui/skeleton";

type ConversationsStatsCardProps = {
  formId?: string;
  title?: string;
};

export const ConversationsStatsCard = ({
  formId,
  title = "Total responses",
}: ConversationsStatsCardProps) => {
  const statsQuery = api.conversation.stats.useQuery({ formId });
  return (
    <QueryComponent
      query={statsQuery}
      loadingComponent={<ConversationsStatsCardSkeleton title={title} />}
    >
      {(data) => (
        <div>
          <div className="flex items-center gap-2 text-lg  font-medium mb-4">
            <span className=" text-muted-foreground">{title}</span>
            <span className="font-bold">{data.totalCount}</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <StatsCard
              title="Completed"
              primaryValue={data.finishedTotalCount.toString()}
              description="All questions have been answered"
            />
            <StatsCard
              title="Partially completed"
              primaryValue={data.partialTotalCount.toString()}
              description="Some questions have not been answered"
            />
            <StatsCard
              title="Live"
              primaryValue={data.liveTotalCount.toString()}
              description="Submission is in-progress"
            />
          </div>
        </div>
      )}
    </QueryComponent>
  );
};

function ConversationsStatsCardSkeleton({
  title,
}: Pick<ConversationsStatsCardProps, "title">) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xl font-bold mb-4">
        <span>{title}</span> <Skeleton className="h-5 w-10" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard.Skeleton />
        <StatsCard.Skeleton />
        <StatsCard.Skeleton />
      </div>
    </div>
  );
}
