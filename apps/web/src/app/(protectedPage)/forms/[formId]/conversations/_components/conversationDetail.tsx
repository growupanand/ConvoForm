import type { Conversation, Transcript } from "@convoform/db/src/schema";
import { Badge } from "@convoform/ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@convoform/ui/components/ui/card";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@convoform/ui/components/ui/table";
import { FileText } from "lucide-react";

import { getConversationTableData } from "@/components/queryComponents/table/utils";
import { SectionCard } from "@/components/sectionCard";
import TranscriptCard from "./transcriptCard";

type Props = {
  conversation: Conversation;
};

export default function ConversationDetail({ conversation }: Readonly<Props>) {
  const tableData = getConversationTableData(conversation.collectedData);
  const tableColumns = Object.keys(tableData);
  const isFormDataEmpty = tableColumns.length === 0;
  const transcript: Transcript[] = conversation.transcript ?? [];

  const getStatusBadge = () => {
    if (conversation.isFinished) {
      return (
        <Badge variant="default" className="text-sm">
          Finished
        </Badge>
      );
    }

    if (conversation.isInProgress) {
      return (
        <Badge variant="secondary" className="flex items-center gap-3 text-sm ">
          <span className="bg-primary flex size-3 animate-pulse rounded-full" />
          <span>In progress</span>
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-sm ">
        Not Finished
      </Badge>
    );
  };

  return (
    <div className="h-full container">
      <div className=" flex items-start justify-between px-3 mb-10">
        <div className="flex flex-col items-start ">
          <div className="flex items-center gap-2">
            <FileText className=" " size={20} />
            <h2 className=" font-medium capitalize text-2xl">
              {conversation.name}
            </h2>
          </div>
          <div className="text-muted-foreground  font-normal text-sm">
            <span className="">Started on - </span>
            <span className="font-medium">
              {conversation.createdAt.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">{getStatusBadge()}</div>
      </div>
      <div className="grid  gap-3 grid-cols-2">
        {!isFormDataEmpty && (
          <SectionCard title="Collected data" titleClassName="font-medium">
            <div className="overflow-hidden rounded-md border bg-white">
              <Table className="">
                <TableBody>
                  {tableColumns.map((columnName, index) => {
                    return (
                      <TableRow
                        key={`${index}-${conversation.id}-${columnName}`}
                      >
                        <TableCell className="py-2">{columnName}</TableCell>
                        <TableCell className="py-2 font-medium">
                          {tableData[columnName]}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        )}
        <SectionCard title="Transcript" titleClassName="font-medium">
          <TranscriptCard
            isBusy={conversation.isInProgress}
            transcript={transcript}
          />
        </SectionCard>
      </div>
    </div>
  );
}

const ConversationDetailSkeleton = () => {
  return (
    <div className="h-full container">
      <Card className="h-full border-none bg-transparent shadow-none">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className=" " />
                <h2 className="text-2xl capitalize">
                  <Skeleton className="h-5 w-20" />
                </h2>
              </div>
              <span className="text-muted-foreground text-sm font-normal">
                <Skeleton className="h-5 w-20" />
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-10 grid-cols-2">
            <div className="overflow-hidden rounded-md border bg-white">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="py-2">
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="py-2 font-medium">
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-2">
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="py-2 font-medium">
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

ConversationDetail.ConversationDetailSkeleton = ConversationDetailSkeleton;
