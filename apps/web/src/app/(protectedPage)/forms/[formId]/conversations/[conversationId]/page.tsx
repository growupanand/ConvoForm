"use client";

import { useOrganization } from "@clerk/nextjs";
import { socket } from "@convoform/websocket-client";
import { notFound } from "next/navigation";
import { useEffect } from "react";

import ConversationDetail from "@/app/(protectedPage)/forms/[formId]/conversations/_components/conversationDetail";
import { api } from "@/trpc/react";

type Props = {
  params: { conversationId: string };
};

export default function ConversationDetailPage(props: Readonly<Props>) {
  const { conversationId } = props.params;
  const { organization, isLoaded: isOrganizationLoaded } = useOrganization();

  const {
    data,
    isLoading: isLoadingConversations,
    refetch,
  } = api.conversation.getOne.useQuery({
    id: conversationId,
  });
  const conversation = data;
  const eventListener = `conversation:${conversationId}`;
  const isLoading = isLoadingConversations || !isOrganizationLoaded;
  const canAccessConversation =
    organization && organization.id === conversation?.organizationId;

  useEffect(() => {
    if (conversation && conversation.isFinished === false) {
      socket.on(eventListener, (data) => {
        const { event } = data;
        if (typeof event === "string" && event === "updated") {
          refetch();
        }
      });
    }

    return () => {
      if (socket.hasListeners(eventListener)) {
        socket.off(eventListener);
      }
    };
  }, [conversation?.id]);

  if (isLoading) {
    return <ConversationDetail.ConversationDetailSkeleton />;
  }

  if (!conversation || !canAccessConversation) {
    return notFound();
  }

  return <ConversationDetail conversation={conversation} />;
}
