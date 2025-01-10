import type { Conversation, Transcript } from "@convoform/db/src/schema";
import { Badge } from "@convoform/ui/components/ui/badge";
import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@convoform/ui/components/ui/card";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";

import { FileText } from "lucide-react";

import { CollectedDataTable } from "./collectedDataTable";
import TranscriptCard from "./transcriptCard";

type Props = {
  conversation: Conversation;
};

export default function ConversationDetail({ conversation }: Readonly<Props>) {
  const transcript: Transcript[] = conversation.transcript ?? [];

  const getStatusBadge = () => {
    if (conversation.isFinished) {
      return (
        <Badge variant="customSuccess" className="text-sm">
          Finished
        </Badge>
      );
    }

    if (conversation.isInProgress) {
      return (
        <Badge
          variant="customWarning"
          className="flex items-center gap-3 text-sm "
        >
          <span className="bg-yellow-700 flex size-3 animate-pulse rounded-full" />
          <span>In progress</span>
        </Badge>
      );
    }

    return (
      <Badge variant="customDanger" className="text-sm ">
        Not completed
      </Badge>
    );
  };

  return (
    <div className="h-full ">
      <CardHeader className="mb-10">
        <div className="flex items-start justify-between ">
          <div className=" flex items-start gap-2">
            <FileText className="size-10" />
            <div className="flex flex-col items-start gap-1">
              <CardTitle className=" text-xl capitalize">
                {conversation.name}
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                {conversation.createdAt.toLocaleString()}
              </div>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid  gap-10 grid-cols-5">
          <div className="col-span-2">
            <div>
              <h2 className="font-montserrat text-muted-foreground mb-2 text-xl">
                Collected data
              </h2>
              <CollectedDataTable collectedData={conversation.collectedData} />
            </div>
          </div>
          <div className="col-span-3">
            <h2 className="font-montserrat text-muted-foreground mb-2 text-xl">
              Transcript
            </h2>
            <TranscriptCard
              isBusy={conversation.isInProgress}
              transcript={transcript}
            />
          </div>
        </div>
      </CardContent>
    </div>
  );
}

const ConversationDetailSkeleton = () => {
  return (
    <div className="h-full">
      <CardHeader className="mb-10">
        <div className="flex items-center justify-between">
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
          <div className="">
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid  gap-10 grid-cols-5">
          <div className="col-span-2">
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
