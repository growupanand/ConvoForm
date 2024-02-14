import { Conversation } from "@convoform/db";
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
  <div>
    <nav className="grid gap-1">
      <div className="flex h-[40px] w-full items-center justify-between ps-3">
        <Skeleton className="h-[15px] w-[80px]" />
        <Skeleton className="h-[15px] w-[40px]" />
      </div>
      <div className="flex h-[40px] w-full items-center justify-between ps-3">
        <Skeleton className="h-[15px] w-[80px]" />
        <Skeleton className="h-[15px] w-[40px]" />
      </div>
      <div className="flex h-[40px] w-full items-center justify-between ps-3">
        <Skeleton className="h-[15px] w-[80px]" />
        <Skeleton className="h-[15px] w-[40px]" />
      </div>
    </nav>
  </div>
);

ConversationsNavigation.ConversationsCardSkelton = ConversationsCardSkelton;
