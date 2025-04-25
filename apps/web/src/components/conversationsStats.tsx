"use client";

import { StatsCard, type StatsCardProps } from "@/components/common/statsCard";
import { QueryComponent } from "@/components/queryComponents/queryComponent";
import { api } from "@/trpc/react";

import { cn, formatDuration } from "@/lib/utils";
import { Badge, Skeleton } from "@convoform/ui";
import { Inbox, Radio } from "lucide-react";
import { StatsGrid } from "./statsComponents/statsGrid";

type ConversationsStatsCardProps = {
  formId?: string;
  title?: string;
  showExtendedStats?: boolean;
};

export const ConversationsStats = ({
  formId,
  title = "Response Metrics",
  showExtendedStats = false,
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
            <Badge variant="secondary">{data.totalCount} total responses</Badge>
          </div>
          <StatsGrid className="gap-x-6">
            <ConversationsStatsCard
              title="Active Now"
              primaryValue={data.liveTotalCount.toString()}
              description="Respondents currently filling out form"
              icon={
                <Radio
                  className={cn(
                    "text-muted-foreground size-5",
                    data.liveTotalCount > 0 &&
                      "visible animate-pulse text-brand-500",
                  )}
                />
              }
            />
            <ConversationsStatsCard
              title="Completed"
              primaryValue={data.finishedTotalCount.toString()}
              description="Respondents answered all questions"
            />
            <ConversationsStatsCard
              title="Incomplete"
              primaryValue={data.partialTotalCount.toString()}
              description="Respondents skipped some questions"
            />

            {showExtendedStats && (
              <>
                <ConversationsStatsCard
                  title="Average completion time"
                  primaryValue={formatDuration(data.averageFinishTimeMs, true)}
                  description="Typical time to submit all answers"
                />
                <ConversationsStatsCard
                  title="Bounce Rate"
                  primaryValue={`${data.bounceRate}%`}
                  description="Users who leave without answering any questions"
                />
              </>
            )}
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
  return <StatsCard className="h-full" {...props} />;
};
