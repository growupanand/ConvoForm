"use client";

import { useEffect } from "react";
import ConversationList from "../conversationList";
import { Card, CardContent } from "../ui/card";
import { useFormStore } from "@/lib/store/formStore";
import { Skeleton } from "../ui/skeleton";

export default function ConversationsListCard() {
  const formStore = useFormStore();
  const { conversations, formId, isLoadingConversations } = formStore;
  const emptyConversations = conversations.length === 0;

  useEffect(() => {
    if (formId) {
      formStore.fetchConversations();
    }
  }, [formId]);

  if (isLoadingConversations || !formId) {
    return <LoadingUI />;
  }

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardContent className="pt-6">
        <ConversationList conversations={conversations} formId={formId} />
        {emptyConversations ? (
          <div className="flex flex-col items-center justify-center">
            <p className="text-gray-500 text-sm">No Conversations</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

const LoadingUI = () => {
  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardContent className="pt-6">
        <h3 className="mb-5 px-4 text-lg font-semibold tracking-tight">
          <Skeleton className="w-20 h-5" />
        </h3>
        <nav className="flex flex-col gap-1">
          <Skeleton className="w-full h-[40px]" />
          <Skeleton className="w-full h-[40px]" />
        </nav>
      </CardContent>
    </Card>
  );
};
