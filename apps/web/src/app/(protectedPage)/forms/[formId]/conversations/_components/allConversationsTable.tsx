"use client";

import { toast } from "@convoform/ui/components/ui/use-toast";
import { InboxIcon } from "lucide-react";

import { AddressBar } from "@/components/common/browserWindow";
import { CopyLinkButton } from "@/components/common/copyLinkButton";
import { EmptyCard } from "@/components/common/emptyCard";
import { QueryTable } from "@/components/queryComponents/table/queryTable";
import { getConversationTableData } from "@/components/queryComponents/table/utils";
import { getFrontendBaseUrl } from "@/lib/url";
import { api } from "@/trpc/react";

type Props = {
  formId: string;
};

export function AllConversationsTable({ formId }: Readonly<Props>) {
  const query = api.conversation.getFormResponsesData.useQuery({
    formId,
  });

  const exportFileName = `Responses ${new Date().toLocaleString()}.csv`;
  const formLink = `${getFrontendBaseUrl()}/view/${formId}`;
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(formLink);
    toast({
      title: "Link copied to clipboard",
    });
  };

  return (
    <QueryTable
      query={query}
      getTableData={(data) => {
        return data.map((item) => {
          const tableData = getConversationTableData(item.collectedData);
          return {
            ["Created"]: item.createdAt.toLocaleString(),
            ["Response name"]: item.name,
            ...tableData,
          };
        });
      }}
      showExportButton
      exportFileName={exportFileName}
      emptyComponent={
        <EmptyCard
          title="No form responses yet"
          description="Start receiving responses by sharing your form with your audience."
          illustration={
            <InboxIcon className="text-muted-foreground h-16 w-16" />
          }
          actionButton={
            <div className=" flex items-center gap-3 rounded-lg bg-gray-100 lg:px-5">
              <AddressBar link={formLink} />
              <CopyLinkButton onClick={copyLinkToClipboard} />
            </div>
          }
        />
      }
    />
  );
}
