import type { Conversation, Transcript } from "@convoform/db/src/schema";
import { SectionHeading } from "@convoform/ui";
import { CardContent, CardHeader, CardTitle } from "@convoform/ui";
import { Skeleton } from "@convoform/ui";

import { FileText, Globe, Timer } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import InsightsCard from "./insightsCard";
import MetadataCard from "./metadataCard";
import TranscriptCard from "./transcriptCard";
import { ConversationStatusBadge } from "@/components/StatusBadge";
import { CollectedDataTable } from "@/components/collectedDataTable";

type Props = {
  conversation: Conversation;
};

export default function ConversationDetail({ conversation }: Readonly<Props>) {
  const transcript: Transcript[] = conversation.transcript ?? [];
  const timeTaken = conversation.finishedAt
    ? formatDuration(
        conversation.finishedAt.getTime() - conversation.createdAt.getTime(),
        true,
      )
    : formatDuration(
        conversation.updatedAt.getTime() - conversation.createdAt.getTime(),
        true,
      );

  return (
    <>
      <CardHeader className="sticky flex flex-row items-center justify-between gap-x-6 top-0 z-30 bg-white/70 backdrop-blur-md mb-6">
        <div className="  flex justify-start items-center gap-2 text-nowrap">
          <FileText className="size-10" />
          <div className="flex flex-col items-start gap-1 ">
            <CardTitle className=" text-primary text-xl capitalize max-w-xs truncate hover:text-wrap">
              {conversation.name}
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              {conversation.createdAt.toLocaleString()}
            </div>
          </div>
        </div>
        <MetadataCard
          metaData={{
            Status: <ConversationStatusBadge conversation={conversation} />,
            "Time taken": {
              value: timeTaken,
              icon: Timer,
            },
            OS: {
              value: conversation.metaData.userAgent?.os?.name,
            },
            Browser: {
              value: conversation.metaData.userAgent?.browser?.name,
              icon: Globe,
            },
            Device: {
              value: conversation.metaData.userAgent?.device?.vendor,
            },
            Country: {
              value: conversation.metaData.geoDetails?.country ? (
                <span>
                  {conversation.metaData.geoDetails?.flag}{" "}
                  {conversation.metaData.geoDetails?.country}
                </span>
              ) : undefined,
            },
            City: {
              value: conversation.metaData.geoDetails?.city,
            },
          }}
        />
        {/* {getStatusBadge()} */}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-10 grid-cols-5">
          <div className="col-span-2 space-y-6">
            {conversation.metaData?.insights && (
              <InsightsCard insights={conversation.metaData.insights} />
            )}
            <div>
              <SectionHeading>Collected information</SectionHeading>
              <CollectedDataTable collectedData={conversation.collectedData} />
            </div>
          </div>
          <div className="col-span-3 space-y-6 ">
            <div>
              <SectionHeading>Conversation transcript</SectionHeading>
              <TranscriptCard
                isBusy={conversation.isInProgress}
                transcript={transcript}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
}

const ConversationDetailSkeleton = () => {
  return (
    <>
      <CardHeader className="sticky flex flex-row items-center justify-between gap-x-6 top-0 z-30 bg-white/70 backdrop-blur-md mb-6">
        <div className="flex justify-start items-center gap-2 text-nowrap">
          <FileText className="size-10" />
          <div className="flex flex-col items-start gap-1">
            <CardTitle>
              <Skeleton className="h-4 w-40" />
            </CardTitle>
            <div>
              <Skeleton className="h-2 w-20" />
            </div>
          </div>
        </div>
        <MetadataCard.Skeleton />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-10 grid-cols-5">
          <div className="col-span-2 space-y-6">
            <InsightsCard.Skeleton />
            <div>
              <SectionHeading>Collected information</SectionHeading>
              <CollectedDataTable.Skeleton />
            </div>
          </div>
          <div className="col-span-3 space-y-6">
            <div>
              <SectionHeading>Conversation transcript</SectionHeading>
              <TranscriptCard.Skeleton />
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
};

ConversationDetail.ConversationDetailSkeleton = ConversationDetailSkeleton;
