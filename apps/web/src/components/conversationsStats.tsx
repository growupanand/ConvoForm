"use client";

import { StatsCard, type StatsCardProps } from "@/components/common/statsCard";
import { QueryComponent } from "@/components/queryComponents/queryComponent";
import { api } from "@/trpc/react";

import { Badge, Skeleton } from "@convoform/ui";
import { Inbox } from "lucide-react";
import { StatsGrid } from "./statsComponents/statsGrid";

type ConversationsStatsCardProps = {
  formId?: string;
  title?: string;
};

export const ConversationsStats = ({
  formId,
  title = "Responses",
}: ConversationsStatsCardProps) => {
  const statsQuery = api.conversation.stats.useQuery({ formId });
  return (
    <QueryComponent
      query={statsQuery}
      loadingComponent={<ConversationsStatsCardSkeleton title={title} />}
    >
      {(data) => (
        <div>
          <div className="flex items-center gap-2 text-lg  mb-4">
            <span className=" text-muted-foreground">
              <Inbox className="mr-2 h-4 w-4 inline" />
              {title}
            </span>
            <Badge variant="secondary">{data.totalCount} total</Badge>
          </div>
          <StatsGrid className="gap-x-6">
            <ConversationsStatsCard
              title="Completed"
              primaryValue={data.finishedTotalCount.toString()}
              description="All questions have been answered"
            />
            <ConversationsStatsCard
              title="Partially completed"
              primaryValue={data.partialTotalCount.toString()}
              description="Some questions have not been answered"
            />
            <ConversationsStatsCard
              title="Live"
              primaryValue={data.liveTotalCount.toString()}
              description="Submission is in-progress"
            />
          </StatsGrid>
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
      <div className="flex items-center gap-2 text-lg mb-4">
        <span className="text-muted-foreground">
          <Inbox className="mr-2 h-4 w-4 inline" />
          {title}
        </span>{" "}
        <Skeleton className="h-5 w-10" />
      </div>

      <div className="grid grid-cols-[repeat(3,_minmax(auto,200px))] gap-x-6">
        <StatsCard.Skeleton />
        <StatsCard.Skeleton />
        <StatsCard.Skeleton />
      </div>
    </div>
  );
}

export const ConversationsStatsCard = (props: StatsCardProps) => {
  return <StatsCard className="grid grid-rows-subgrid row-span-2" {...props} />;
};
