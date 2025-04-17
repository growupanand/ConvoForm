"use client";

import { useOrganization } from "@clerk/nextjs";
import {
  registerEventHandler,
  removeEventHandler,
  sendMessage,
} from "@convoform/websocket-client";
import { notFound } from "next/navigation";
import { use, useEffect } from "react";

import ConversationDetail from "@/app/(protectedPage)/forms/[formId]/conversations/_components/conversationDetail";
import { api } from "@/trpc/react";

type Props = {
  params: Promise<{ conversationId: string }>;
};

export default function ConversationDetailPage(props: Readonly<Props>) {
  const params = use(props.params);
  const { conversationId } = params;
  const { organization, isLoaded: isOrganizationLoaded } = useOrganization();

  const {
    data,
    isLoading: isLoadingConversations,
    refetch: refetchConversationDetails,
  } = api.conversation.getOne.useQuery({
    id: conversationId,
  });
  const conversation = data;
  const isLoading = isLoadingConversations || !isOrganizationLoaded;
  const canAccessConversation =
    organization && organization.id === conversation?.organizationId;

  useEffect(() => {
    // Join the conversation room using sendMessage instead of socket.emit
    sendMessage("join-room-conversation", { conversationId });

    // Handle conversation updates
    const handleConversationUpdate = () => {
      refetchConversationDetails();
    };

    // Register the event handler
    registerEventHandler("conversation:updated", handleConversationUpdate);
    registerEventHandler("conversation:stopped", handleConversationUpdate);

    return () => {
      // Clean up by removing the event handler
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
    />
  );
}
