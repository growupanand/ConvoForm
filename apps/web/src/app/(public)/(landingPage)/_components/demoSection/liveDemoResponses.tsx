"use client";

import { QueryComponent } from "@/components/queryComponents/queryComponent";
import { api } from "@/trpc/react";
import type { Conversation } from "@convoform/db/src/schema";
import {
  Badge,
  ScrollArea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@convoform/ui";
import {
  registerEventHandler,
  removeEventHandler,
  sendMessage,
} from "@convoform/websocket-client";
import { formatDistanceToNow } from "date-fns";
import { CircleDot } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { DEMO_FORM_ID } from "../constants";
import { ResponsesTableSkeleton } from "./responsesTableSkeleton";

// Custom hook to handle websocket connections and updates
function useFormWebsocket(formId: string, refetch: () => void) {
  useEffect(() => {
    const handleConversationUpdate = () => refetch();

    // Subscribe to updates for this conversation
    sendMessage("join-room-form", { formId });

    // Register event handlers
    registerEventHandler("conversation:started", handleConversationUpdate);
    registerEventHandler("conversation:updated", handleConversationUpdate);
    registerEventHandler("conversation:stopped", handleConversationUpdate);

    return () => {
      // Clean up event handlers when component unmounts
      removeEventHandler("conversation:started", handleConversationUpdate);
      removeEventHandler("conversation:updated", handleConversationUpdate);
      removeEventHandler("conversation:stopped", handleConversationUpdate);
    };
  }, [formId, refetch]);
}

// Component for the status badge
function StatusBadge({
  conversation,
  existingResponses,
}: { conversation: Conversation; existingResponses: Conversation[] }) {
  const isActive = existingResponses.map((c) => c.id).includes(conversation.id);
  const isCompleted = conversation.finishedAt;

  if (isActive) {
    return (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 flex items-center gap-1"
      >
        <CircleDot className="size-3 text-green-500 animate-pulse" />
        <span>Active</span>
      </Badge>
    );
  }

  if (isCompleted) {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700">
        Completed
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-gray-50 text-gray-700">
      Abandoned
    </Badge>
  );
}

// Component for a single response row
function ResponseRow({
  conversation,
  existingResponses,
}: { conversation: Conversation; existingResponses: Conversation[] }) {
  return (
    <motion.tr key={conversation.id} layout>
      <TableCell className="font-medium">
        {conversation.name || "Anonymous submission"}
        {conversation.collectedData.length > 0 && (
          <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
            {conversation.collectedData.find((d) => d.fieldValue)?.fieldValue ||
              "No data"}
          </div>
        )}
      </TableCell>
      <TableCell>
        <StatusBadge
          conversation={conversation}
          existingResponses={existingResponses}
        />
      </TableCell>
      <TableCell className="text-right text-sm text-gray-500">
        {formatDistanceToNow(new Date(conversation.createdAt), {
          addSuffix: true,
        })}
      </TableCell>
    </motion.tr>
  );
}

// Component for the responses table
function ResponsesTable({ responses }: { responses: Conversation[] }) {
  const sortedResponses = [...responses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <ScrollArea className="h-[300px] rounded-md">
      <Table>
        <TableHeader className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm">
          <TableRow>
            <TableHead className="w-[200px]">Submission</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {responses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-gray-500"
                >
                  No responses yet - be the first to try the demo form!
                </TableCell>
              </TableRow>
            ) : (
              sortedResponses.map((conversation) => (
                <ResponseRow
                  key={conversation.id}
                  conversation={conversation}
                  existingResponses={responses}
                />
              ))
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

// Main component
export function LiveDemoResponses() {
  // Get existing responses for the demo form
  const query = api.conversation.getDemoFormResponses.useQuery(
    { formId: DEMO_FORM_ID },
    { refetchInterval: 30000 }, // Refetch every 30 seconds
  );

  // Set up websocket connection for live updates
  useFormWebsocket(DEMO_FORM_ID, query.refetch);

  return (
    <QueryComponent query={query} loadingComponent={<ResponsesTableSkeleton />}>
      {(data) => <ResponsesTable responses={data ?? []} />}
    </QueryComponent>
  );
}
