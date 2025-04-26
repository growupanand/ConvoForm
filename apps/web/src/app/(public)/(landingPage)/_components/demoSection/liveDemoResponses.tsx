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

// Sample data to replace "No data" entries
const sampleResponses = [
  {
    id: "sample-1",
    name: "Marketing Survey",
    fieldValue: "Feedback on new product features",
    status: "active",
    time: "5 minutes ago",
  },
  {
    id: "sample-2",
    name: "Customer Feedback",
    fieldValue: "Support ticket submission",
    status: "active",
    time: "12 minutes ago",
  },
];

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
function StatusBadge({ conversation }: { conversation: Conversation }) {
  const isActive = conversation.isInProgress;
  const isCompleted = !!conversation.finishedAt;

  if (isCompleted) {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700">
        Completed
      </Badge>
    );
  }

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

  return (
    <Badge variant="outline" className="bg-gray-50 text-gray-700">
      Abandoned
    </Badge>
  );
}

// Component for a single response row
function ResponseRow({
  conversation,
}: { conversation: Conversation; existingResponses: Conversation[] }) {
  const collectedDataWithValues = conversation.collectedData.filter(
    (i) => i.fieldValue,
  );

  // Calculate completion percentage
  const completionPercentage = conversation.finishedAt
    ? 100
    : Math.round(
        (collectedDataWithValues.length / conversation.collectedData.length) *
          100,
      );

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
        <StatusBadge conversation={conversation} />
      </TableCell>
      <TableCell className="text-center">
        <span className="font-medium">{completionPercentage}%</span>
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

  // Use sample data when there are no real responses
  const displayResponses = responses.length === 0 ? [] : sortedResponses;

  return (
    <ScrollArea className="h-[300px] rounded-md">
      <Table>
        <TableHeader className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm">
          <TableRow>
            <TableHead className="w-[200px]">Submission</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Completion</TableHead>
            <TableHead className="text-right">Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {displayResponses.length === 0 ? (
              <>
                {/* Sample entries instead of empty state */}
                {sampleResponses.map((sample) => (
                  <TableRow key={sample.id} className="opacity-70">
                    <TableCell className="font-medium">
                      {sample.name}
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
                        {sample.fieldValue}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 flex items-center gap-1"
                      >
                        <CircleDot className="size-3 text-green-500 animate-pulse" />
                        <span>Active</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">45%</span>
                        <span className="text-xs text-gray-500">
                          5 answered
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm">3 min</span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {sample.time}
                    </TableCell>
                  </TableRow>
                ))}
              </>
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
