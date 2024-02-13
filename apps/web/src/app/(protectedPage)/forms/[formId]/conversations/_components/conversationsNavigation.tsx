import { Conversation } from "@convoform/db";
import { Card, CardContent } from "@convoform/ui/components/ui/card";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";

import { timeAgo } from "@/lib/utils";
import { SecondaryNavigation } from "../../../../../../components/common/secondaryNavigation";

interface ConversationsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  conversations: Conversation[];
  formId: string;
}

export function ConversationsNavigation({
  conversations,
  formId,
}: Readonly<ConversationsCardProps>) {
  const isEmptyConversations = conversations.length === 0;
  const navigationItems = conversations.map((conversation) => ({
    href: `/forms/${formId}/conversations/${conversation.id}`,
    title: (
      <div className="flex w-full items-center justify-between">
        <span className="capitalize">{conversation.name}</span>
        <span className="text-muted-foreground font-light">
          {timeAgo(conversation.createdAt)}
        </span>
      </div>
    ),
  }));

  return (
    <>
      {isEmptyConversations ? (
        <div className="py-3 text-center">
          <p className="text-sm text-gray-500">No Conversations</p>
        </div>
      ) : (
        <SecondaryNavigation items={navigationItems} />
      )}
    </>
  );
}

const ConversationsCardSkelton = () => (
  <Card className="border-0 bg-transparent shadow-none">
    <CardContent className="pt-6">
      <h3 className="mb-5 px-4 text-lg font-semibold tracking-tight">
        <Skeleton className="h-5 w-20" />
      </h3>
      <nav className="flex flex-col gap-1">
        <Skeleton className="h-[40px] w-full" />
        <Skeleton className="h-[40px] w-full" />
      </nav>
    </CardContent>
  </Card>
);

ConversationsNavigation.ConversationsCardSkelton = ConversationsCardSkelton;
