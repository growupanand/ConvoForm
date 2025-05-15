import type { Conversation, Transcript } from "@convoform/db/src/schema";
import { Badge, SectionHeading } from "@convoform/ui";
import { CardContent, CardHeader, CardTitle } from "@convoform/ui";
import { Skeleton } from "@convoform/ui";

import { FileText, Globe, Timer } from "lucide-react";

import Spinner from "@/components/common/spinner";
import { formatDuration } from "@/lib/utils";
import { CollectedDataTable } from "./collectedDataTable";
import InsightsCard from "./insightsCard";
import MetadataCard from "./metadataCard";
import TranscriptCard from "./transcriptCard";

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

  const getStatusBadge = () => {
    if (conversation.finishedAt) {
      return (
        <Badge variant="default" className="text-xs">
          Finished
        </Badge>
      );
    }

    if (conversation.isInProgress) {
      return (
        <Badge variant="secondary" className=" text-xs ">
          <Spinner size="xs" className="me-1" />
          In progress
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-xs ">
        Incomplete
      </Badge>
    );
  };

  return (
    <div className="h-full pb-10">
      <CardHeader>
        <div className="  flex items-center gap-2">
          <FileText className="size-10" />
          <div className="flex flex-col items-start gap-1">
            <CardTitle className=" text-primary text-xl capitalize">
              {conversation.name}
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              {conversation.createdAt.toLocaleString()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <MetadataCard
          metaData={{
            Status: getStatusBadge(),
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
    </div>
  );
}

const ConversationDetailSkeleton = () => {
  return (
    <div className="h-full">
      <CardHeader>
        <div className=" flex items-center gap-2">
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
      <CardContent>
        <div className="grid  gap-10 grid-cols-5">
          <div className="col-span-2 space-y-4">
            <InsightsCard.Skeleton />
            <div>
              <h2 className="font-montserrat text-muted-foreground mb-2 text-xl">
                Collected data
              </h2>
              <CollectedDataTable.Skeleton />
            </div>
          </div>
          <div className="col-span-3">
            <h2 className="font-montserrat text-muted-foreground mb-2 text-xl">
              Transcript
            </h2>
            <TranscriptCard.Skeleton />
          </div>
        </div>
      </CardContent>
    </div>
  );
};

ConversationDetail.ConversationDetailSkeleton = ConversationDetailSkeleton;
