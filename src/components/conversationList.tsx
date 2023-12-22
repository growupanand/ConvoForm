import { Conversation } from "@prisma/client";
import { FileText } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { SidebarNav } from "./ui/sidebar-nav";

type Props = {
  formId: string;
  conversations: Pick<Conversation, "id" | "name" | "createdAt">[];
};

export default function ConversationList({
  conversations,
  formId,
}: Readonly<Props>) {
  const items = conversations.map((conversation) => ({
    href: `/forms/${formId}/conversations/${conversation.id}`,
    title: (
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          <span className="capitalize">{conversation.name}</span>
        </div>
        <span className="text-muted-foreground font-light">
          {timeAgo(conversation.createdAt)}
        </span>
      </div>
    ),
  }));

  return <SidebarNav heading="Conversations" items={items} />;
}
