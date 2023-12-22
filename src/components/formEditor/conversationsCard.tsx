"use client";

import ConversationList from "../conversationList";
import { Conversation } from "@prisma/client";
import { Card, CardContent } from "../ui/card";
import { redirect, useParams } from "next/navigation";
import { useEffect } from "react";

type Props = {
  formId: string;
  conversations: Pick<Conversation, "id" | "name" | "createdAt">[];
};

export default function ConversationsCard(props: Props) {
  const { conversations, formId } = props;
  const params = useParams();
  const { conversationId } = params;

  useEffect(() => {
    if (!conversationId && conversations.length > 0 && formId) {
      redirect(`/forms/${formId}/conversations/${conversations[0].id}`);
    }
  }, [conversationId, conversations, formId]);

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardContent className="pt-6">
        <ConversationList conversations={conversations} formId={formId} />
      </CardContent>
    </Card>
  );
}
