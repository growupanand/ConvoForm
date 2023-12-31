import { timeAgo } from "@/lib/utils";
import { SidebarNav } from "../ui/sidebar-nav";
import { Conversation } from "@prisma/client";
import { Skeleton } from "../ui/skeleton";
import { FileText } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface ConversationsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  conversations: Conversation[];
  formId: string;
}

export function ConversationsCard({
  conversations,
  formId,
}: Readonly<ConversationsCardProps>) {
  const emptyConversations = conversations.length === 0;

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardContent className="p-0 lg:pt-6">
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

const ConversationsCardSkelton = () => (
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

ConversationsCard.ConversationsCardSkelton = ConversationsCardSkelton;

const ConversationList = ({
  conversations,
  formId,
}: Readonly<{
  formId: string;
  conversations: Pick<Conversation, "id" | "name" | "createdAt">[];
}>) => {
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
};
