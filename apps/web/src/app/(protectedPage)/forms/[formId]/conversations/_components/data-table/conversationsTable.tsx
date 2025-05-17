"use client";

import { Skeleton, toast } from "@convoform/ui";
import { InboxIcon } from "lucide-react";

import { AddressBar } from "@/components/common/browserWindow";
import { CopyLinkButton } from "@/components/common/copyLinkButton";
import { EmptyCard } from "@/components/common/emptyCard";
import { TableComponentLoading } from "@/components/queryComponents/table/table";
import { getFrontendBaseUrl } from "@/lib/url";
import type { Conversation } from "@convoform/db/src/schema";
import { useParams } from "next/navigation";
import { ConversationsDataTable } from "./conversations-data-table";

function ConversationsTable({ data }: { data: Conversation[] }) {
  const { formId } = useParams<{ formId: string }>();

  return <ConversationsDataTable data={data} formId={formId} />;
}

function ConversationsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-end gap-4">
          <Skeleton className="h-9 w-32" />{" "}
          {/* Skeleton for per page selector */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />{" "}
            {/* Skeleton for pagination button */}
            <Skeleton className="h-9 w-16" />{" "}
            {/* Skeleton for pagination info */}
            <Skeleton className="h-9 w-9" />{" "}
            {/* Skeleton for pagination button */}
          </div>
        </div>
      </div>
      <TableComponentLoading rows={3} />
    </div>
  );
}

function ConversationsTableEmpty({ formId }: { formId: string }) {
  const formLink = `${getFrontendBaseUrl()}/view/${formId}`;
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(formLink);
    toast.info("Link copied to clipboard");
  };
  return (
    <EmptyCard
      title="No form responses yet"
      description="Start receiving responses by sharing your form with your audience."
      illustration={<InboxIcon className="text-muted-foreground h-16 w-16" />}
      actionButton={
        <div className=" flex items-center gap-3 rounded-lg bg-gray-100 px-5">
          <AddressBar link={formLink} />
          <CopyLinkButton onClick={copyLinkToClipboard} />
        </div>
      }
    />
  );
}

ConversationsTable.Skeleton = ConversationsTableSkeleton;
ConversationsTable.Empty = ConversationsTableEmpty;

export { ConversationsTable };
