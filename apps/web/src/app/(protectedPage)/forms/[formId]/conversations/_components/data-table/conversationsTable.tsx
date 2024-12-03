"use client";

import { toast } from "@convoform/ui/components/ui/use-toast";
import { InboxIcon } from "lucide-react";

import { AddressBar } from "@/components/common/browserWindow";
import { CopyLinkButton } from "@/components/common/copyLinkButton";
import { EmptyCard } from "@/components/common/emptyCard";
import { TableComponentLoading } from "@/components/queryComponents/table/table";
import { getFrontendBaseUrl } from "@/lib/url";
import type { Conversation } from "@convoform/db/src/schema";
import { ConversationsDataTable } from "./conversations-data-table";

function ConversationsTable({ data }: { data: Conversation[] }) {
  return <ConversationsDataTable data={data} />;
}

function ConversationsTableSkeleton() {
  return <TableComponentLoading rows={2} />;
}

function ConversationsTableEmpty({ formId }: { formId: string }) {
  const formLink = `${getFrontendBaseUrl()}/view/${formId}`;
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(formLink);
    toast({
      title: "Link copied to clipboard",
    });
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
