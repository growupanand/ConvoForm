import type { Conversation } from "@convoform/db/src/schema";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";

import { SecondaryNavigation } from "@/components/common/secondaryNavigation";
import Spinner from "@/components/common/spinner";
import { cn, timeAgo } from "@/lib/utils";

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
        <div className="flex items-center gap-3">
          {conversation.isInProgress ? (
            <Spinner size="sm" />
          ) : (
            <span
              className={cn(
                "flex size-2 rounded-full",
                conversation.isFinished
                  ? "bg-primary"
                  : "border border-gray-500 ",
              )}
            />
          )}
          <span className="capitalize">
            {conversation.isInProgress ? "In progress..." : conversation.name}
          </span>
        </div>
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
      <div className="flex h-[40px] w-full items-center justify-between">
        <Skeleton className="h-[15px] w-[80px]" />
        <Skeleton className="h-[15px] w-[40px]" />
      </div>
      <div className="flex h-[40px] w-full items-center justify-between">
        <Skeleton className="h-[15px] w-[80px]" />
        <Skeleton className="h-[15px] w-[40px]" />
      </div>
      <div className="flex h-[40px] w-full items-center justify-between">
        <Skeleton className="h-[15px] w-[80px]" />
        <Skeleton className="h-[15px] w-[40px]" />
      </div>
    </nav>
  </div>
);

ConversationsNavigation.ConversationsCardSkelton = ConversationsCardSkelton;
