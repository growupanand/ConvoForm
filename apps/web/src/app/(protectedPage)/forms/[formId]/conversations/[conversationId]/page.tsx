"use client";

import { useOrganization } from "@clerk/nextjs";
import {
  registerEventHandler,
  removeEventHandler,
  sendMessage,
} from "@convoform/websocket-client";
import { notFound } from "next/navigation";
import { use, useEffect, useRef } from "react";

import ConversationDetail from "@/app/(protectedPage)/forms/[formId]/conversations/_components/conversationDetail";
import { api } from "@/trpc/react";

const JOURNEY_POLL_INTERVAL_MS = 15_000;
const JOURNEY_POLL_TIMEOUT_MS = 10 * 60 * 1_000;

type Props = {
  params: Promise<{ conversationId: string }>;
};

export default function ConversationDetailPage(props: Readonly<Props>) {
  const params = use(props.params);
  const { conversationId } = params;
  const { organization, isLoaded: isOrganizationLoaded } = useOrganization();
  const pendingJourneySinceRef = useRef<number | null>(null);

  const {
    data,
    isLoading: isLoadingConversations,
    refetch: refetchConversationDetails,
  } = api.conversation.getOne.useQuery({
    id: conversationId,
  });

  // Fetch the journey data before rendering the detail so the strip never
  // shows a temporary webhook node for forms without webhooks.
  const {
    data: journeyData,
    isLoading: isLoadingJourney,
    refetch: refetchJourney,
  } = api.webhookEndpoint.deliveriesForConversation.useQuery(
    { conversationId },
    {
      refetchOnWindowFocus: false,
      refetchInterval: (query) => {
        const deliveries = query.state.data?.deliveries;
        const hasPendingDelivery = deliveries?.some(
          (delivery) =>
            delivery.status === "pending" || delivery.status === "delivering",
        );

        if (!hasPendingDelivery) {
          pendingJourneySinceRef.current = null;
          return false;
        }

        if (pendingJourneySinceRef.current == null) {
          pendingJourneySinceRef.current = Date.now();
        }

        if (
          Date.now() - pendingJourneySinceRef.current >=
          JOURNEY_POLL_TIMEOUT_MS
        ) {
          return false;
        }

        return JOURNEY_POLL_INTERVAL_MS;
      },
    },
  );

  const conversation = data;
  const isLoading =
    isLoadingConversations || isLoadingJourney || !isOrganizationLoaded;
  const canAccessConversation =
    organization && organization.id === conversation?.organizationId;

  useEffect(() => {
    // Join the conversation room using sendMessage instead of socket.emit
    sendMessage("join-room-conversation", { conversationId });

    // Handle conversation updates
    const handleConversationUpdate = () => {
      refetchConversationDetails();
      refetchJourney();
    };

    // Register the event handler
    registerEventHandler("conversation:started", handleConversationUpdate);
    registerEventHandler("conversation:updated", handleConversationUpdate);
    registerEventHandler("conversation:stopped", handleConversationUpdate);

    return () => {
      // Clean up by removing the event handler
      removeEventHandler("conversation:started", handleConversationUpdate);
      removeEventHandler("conversation:updated", handleConversationUpdate);
      removeEventHandler("conversation:stopped", handleConversationUpdate);
    };
  }, [conversationId]);

  if (isLoading) {
    return <ConversationDetail.ConversationDetailSkeleton />;
  }

  if (!conversation || !canAccessConversation) {
    return notFound();
  }

  return (
    <ConversationDetail
      conversation={{
        ...conversation,
        transcript: conversation.transcript ?? [],
      }}
      journeyData={journeyData}
    />
  );
}
