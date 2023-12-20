"use client";

import ConversationList from "../conversationList";
import { Conversation } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
    if (!conversationId) {
      redirect(`/forms/${formId}/conversations/${conversations[0].id}`);
    }
  }, [conversationId]);

  return (
    <div className="p-3 h-full">
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <ConversationList conversations={conversations} formId={formId} />
        </CardContent>
      </Card>
    </div>
  );
}
