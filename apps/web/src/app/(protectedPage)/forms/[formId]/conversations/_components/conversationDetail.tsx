import type { Conversation, Transcript } from "@convoform/db/src/schema";
import { Badge, SectionHeading } from "@convoform/ui";
import { CardContent, CardHeader, CardTitle } from "@convoform/ui";
import { Skeleton } from "@convoform/ui";

import { ConversationStatusBadge } from "@/components/StatusBadge";
import { FormFieldResponsesTable } from "@/components/formFieldResponsesTable";
import { formatDuration } from "@/lib/utils";
import { FileText, Globe, Timer } from "lucide-react";
import InsightsCard from "./insightsCard";
import MetadataCard from "./metadataCard";
import TranscriptCard from "./transcriptCard";
import { getSentimentVariant, getToneVariant } from "./utils";

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
        <div className="  flex justify-start items-start gap-2 text-nowrap">
          <FileText className="size-10" />
          <div className="flex flex-col items-start ">
            <CardTitle className=" text-primary text-xl capitalize max-w-xs truncate hover:text-wrap">
              {conversation.name}
            </CardTitle>
            <div className="text-sm text-subtle-foreground">
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
      <CardContent>
        <div className="grid gap-10 grid-cols-5 px-2">
          <div className="col-span-2 space-y-6">
            {conversation.metaData?.insights && (
              <InsightsCard insights={conversation.metaData.insights} />
            )}
            <div>
              <ConversationDetailSectionHeading>
                Collected information
              </ConversationDetailSectionHeading>
              <div className="border rounded-lg">
                <FormFieldResponsesTable
                  formFieldResponses={conversation.formFieldResponses}
                />
              </div>
            </div>
          </div>
          <div className="col-span-3 space-y-6 ">
            <div>
              <div className="flex justify-between items-baseline">
                <ConversationDetailSectionHeading>
                  Chat History
                </ConversationDetailSectionHeading>
                {conversation.metaData?.insights && (
                  <div className="flex gap-2">
                    <Badge
                      variant={getToneVariant(
                        conversation.metaData.insights.userTone,
                      )}
                      className=" capitalize"
                    >
                      {conversation.metaData.insights.userTone}
                    </Badge>
                    <Badge
                      variant={getSentimentVariant(
                        conversation.metaData.insights.userSentiment,
                      )}
                      className=" capitalize"
                    >
                      {conversation.metaData.insights.userSentiment}
                    </Badge>
                  </div>
                )}
              </div>
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
      <CardContent>
        <div className="grid gap-10 grid-cols-5 px-2">
          <div className="col-span-2 space-y-6">
            <InsightsCard.Skeleton />
            <div>
              <ConversationDetailSectionHeading>
                Collected information
              </ConversationDetailSectionHeading>
              <div className="border rounded-lg">
                <FormFieldResponsesTable.Skeleton />
              </div>
            </div>
          </div>
          <div className="col-span-3 space-y-6">
            <div>
              <ConversationDetailSectionHeading>
                Chat History
              </ConversationDetailSectionHeading>
              <TranscriptCard.Skeleton />
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
};

ConversationDetail.ConversationDetailSkeleton = ConversationDetailSkeleton;

function ConversationDetailSectionHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SectionHeading className="py-2 mb-2">{children}</SectionHeading>;
}
