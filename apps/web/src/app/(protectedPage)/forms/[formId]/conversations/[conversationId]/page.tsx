"use client";

import { useOrganization } from "@clerk/nextjs";
import { socket } from "@convoform/websocket-client";
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
    socket.emit("join-room-conversation", { conversationId });
    socket.on("conversation:updated", () => {
      refetchConversationDetails();
    });

    return () => {
      /**
       * Note: It is important to remove listener before unmount,
       * otherwise the handler of the listener will be called multiple times,
       * E.g. you will see multiple toasts or the refetch will be called multiple times
       */
      if (socket.hasListeners("conversation:updated")) {
        socket.off("conversation:updated");
      }
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
