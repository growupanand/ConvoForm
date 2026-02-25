import type { Conversation, Transcript } from "@convoform/db/src/schema";
import { Badge, SectionHeading } from "@convoform/ui";
import { CardContent, CardHeader, CardTitle } from "@convoform/ui";
import { Skeleton } from "@convoform/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@convoform/ui";

import { ConversationStatusBadge } from "@/components/StatusBadge";
import { FormFieldResponsesTable } from "@/components/formFieldResponsesTable";
import { formatDuration } from "@/lib/utils";
import { FileText, Globe, Info, Send, Timer } from "lucide-react";
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
            Channel: {
              value:
                conversation.channelType?.toLowerCase() === "telegram" &&
                conversation.metaData.channel ? (
                  <ChannelDetailsPopover
                    channel={
                      conversation.metaData.channel as Record<string, unknown>
                    }
                    channelType={conversation.channelType}
                  />
                ) : (
                  <span className="capitalize">
                    {conversation.channelType || "Web"}
                  </span>
                ),
              icon:
                conversation.channelType?.toLowerCase() === "telegram"
                  ? Send
                  : Globe,
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

function ChannelDetailsPopover({
  channel,
  channelType,
}: { channel: Record<string, unknown>; channelType?: string | null }) {
  const fromUser = channel.fromUser as Record<string, any> | undefined;

  let channelName = "Channel";
  if (channelType?.toLowerCase() === "telegram") {
    channelName = "Telegram";
  } else if (channelType) {
    channelName = channelType.charAt(0).toUpperCase() + channelType.slice(1);
  }

  return (
    <Popover>
      <PopoverTrigger className="hover:underline flex items-center gap-1.5 decoration-primary underline-offset-4 outline-none">
        {channelName}
        <Info className="size-3.5 text-subtle-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 outline-none" sideOffset={10}>
        <div className="space-y-4">
          <h4 className="font-semibold text-sm leading-none">
            {channelName} Profile
          </h4>
          <div className="grid grid-cols-2 gap-y-4 gap-x-4 pt-2">
            {fromUser?.firstName && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-subtle-foreground uppercase tracking-widest">
                  First Name
                </span>
                <span className="text-xs font-medium text-foreground">
                  {fromUser.firstName}
                </span>
              </div>
            )}
            {fromUser?.lastName && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-subtle-foreground uppercase tracking-widest">
                  Last Name
                </span>
                <span className="text-xs font-medium text-foreground">
                  {fromUser.lastName}
                </span>
              </div>
            )}
            {fromUser?.username && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-subtle-foreground uppercase tracking-widest">
                  Username
                </span>
                <span className="text-xs font-medium text-foreground">
                  @{fromUser.username}
                </span>
              </div>
            )}
            {channel.chatType && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-subtle-foreground uppercase tracking-widest">
                  Chat Type
                </span>
                <span className="text-xs font-medium text-foreground capitalize">
                  {String(channel.chatType)}
                </span>
              </div>
            )}
            {fromUser?.languageCode && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-subtle-foreground uppercase tracking-widest">
                  Language
                </span>
                <span className="text-xs font-medium text-foreground uppercase">
                  {fromUser.languageCode}
                </span>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
