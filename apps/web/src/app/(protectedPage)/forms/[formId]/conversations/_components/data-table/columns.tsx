import { SafeCellRenderer } from "@/components/queryComponents/table/SafeCellRenderer";
import { timeAgo } from "@/lib/utils";
import type { Conversation } from "@convoform/db/src/schema";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@convoform/ui";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

type ConversationData = Pick<
  Conversation,
  "id" | "name" | "createdAt" | "finishedAt" | "isInProgress"
>;

export type ConversationTableData = Omit<
  ConversationData,
  "finishedAt" | "isInProgress"
> & {
  status: string;
};

export function useConversationColumns(
  formId: string,
  uniqueFormFieldResponsesColumns: string[],
) {
  const baseColumnsDefs: ColumnDef<ConversationTableData>[] = useMemo(() => {
    return [
      {
        accessorKey: "name",
        header: "Conversation Name",
        cell: (info) => (
          <span>
            <Button
              variant="link"
              size="sm"
              className="font-medium h-auto"
              asChild
            >
              <Link
                href={`/forms/${formId}/conversations/${info.row.original.id}`}
              >
                <FileText className="size-4 me-2 " />
                <span>{info.row.original.name}</span>
              </Link>
            </Button>
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Submitted At",
        cell: (info) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-muted-foreground ">
                {timeAgo(info.row.original.createdAt)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{info.row.original.createdAt.toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
      },
    ];
  }, [formId]);

  const uniqueFormFieldResponsesColumnsDefs: ColumnDef<ConversationTableData>[] =
    useMemo(() => {
      return uniqueFormFieldResponsesColumns.map((column) => {
        return {
          accessorKey: column,
          header: column,
          cell: (info) => (
            <SafeCellRenderer
              value={info.getValue()}
              className="min-w-[50px] max-w-[200px]"
            />
          ),
        };
      });
    }, [uniqueFormFieldResponsesColumns]);

  return useMemo(
    () => [...baseColumnsDefs, ...uniqueFormFieldResponsesColumnsDefs],
    [baseColumnsDefs, uniqueFormFieldResponsesColumnsDefs],
  );
}
