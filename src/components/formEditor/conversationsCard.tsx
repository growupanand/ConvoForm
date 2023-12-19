"use client";

import ConversationList from "../conversationList";
import { Conversation } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type Props = {
  formId: string;
  conversations: Pick<Conversation, "id" | "name" | "createdAt">[];
};

export default function ConversationsCard(props: Props) {
  const { conversations, formId } = props;

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
