"use client";

import { useEffect } from "react";

import ConversationDetail from "@/app/(protectedPage)/forms/[formId]/conversations/_components/conversationDetail";
import { socket } from "@/socket";
import { api } from "@/trpc/react";
import Loading from "./loading";
import Notfound from "./not-found";

type Props = {
  params: { conversationId: string };
};

export default function ConversationDetailPage(props: Readonly<Props>) {
  const { conversationId } = props.params;

  const { data, isLoading, refetch } = api.conversation.getOne.useQuery({
    id: conversationId,
  });
  const conversation = data;
  const eventListener = `conversation:${conversationId}`;

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
    return <Loading />;
  }

  if (!conversation) {
    return <Notfound />;
  }

  return <ConversationDetail conversation={conversation} />;
}
