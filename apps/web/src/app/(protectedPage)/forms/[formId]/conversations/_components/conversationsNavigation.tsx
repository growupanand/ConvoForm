import type { Conversation } from "@convoform/db/src/schema";
import { Skeleton } from "@convoform/ui";

import { SecondaryNavigation } from "@/components/common/secondaryNavigation";
import Spinner from "@/components/common/spinner";
import { cn, timeAgo } from "@/lib/utils";

type DateGroup = {
  label: string;
  conversations: Conversation[];
};

function groupConversationsByDate(conversations: Conversation[]): DateGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Start of this week (Sunday)
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());

  // Start of this month
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const groups: DateGroup[] = [
    { label: "Today", conversations: [] },
    { label: "Yesterday", conversations: [] },
    { label: "This Week", conversations: [] },
    { label: "This Month", conversations: [] },
    { label: "Older", conversations: [] },
  ];

  conversations.forEach((conversation) => {
    const createdAt = new Date(conversation.createdAt);
    const createdDate = new Date(
      createdAt.getFullYear(),
      createdAt.getMonth(),
      createdAt.getDate(),
    );

    if (createdDate.getTime() === today.getTime()) {
      groups.find((g) => g.label === "Today")?.conversations.push(conversation);
    } else if (createdDate.getTime() === yesterday.getTime()) {
      groups
        .find((g) => g.label === "Yesterday")
        ?.conversations.push(conversation);
    } else if (createdAt >= thisWeekStart && createdDate < yesterday) {
      groups
        .find((g) => g.label === "This Week")
        ?.conversations.push(conversation);
    } else if (createdAt >= thisMonthStart && createdAt < thisWeekStart) {
      groups
        .find((g) => g.label === "This Month")
        ?.conversations.push(conversation);
    } else {
      groups.find((g) => g.label === "Older")?.conversations.push(conversation);
    }
  });

  // Return only groups that have conversations
  return groups.filter((group) => group.conversations.length > 0);
}

interface ConversationsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  conversations: Conversation[];
  formId: string;
}

export function ConversationsNavigation({
  conversations,
  formId,
}: Readonly<ConversationsCardProps>) {
  const isEmptyConversations = conversations.length === 0;

  if (isEmptyConversations) {
    return (
      <div className="py-3 text-center">
        <p className="text-sm text-gray-500">No Conversations</p>
      </div>
    );
  }

  const dateGroups = groupConversationsByDate(conversations);

  const createNavigationItems = (groupConversations: Conversation[]) =>
    groupConversations.map((conversation) => ({
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
                  conversation.finishedAt
                    ? "bg-primary"
                    : "border border-gray-500 ",
                )}
              />
            )}
            <span className="capitalize">
              {conversation.isInProgress ? "In progress..." : conversation.name}
            </span>
          </div>
          <span className="subtle-foreground font-light">
            {timeAgo(conversation.createdAt)}
          </span>
        </div>
      ),
    }));

  return (
    <div className="space-y-4">
      {dateGroups.map((group, index) => (
        <SecondaryNavigation
          key={group.label}
          heading={group.label}
          items={createNavigationItems(group.conversations)}
          className={index > 0 ? "mt-4" : ""}
        />
      ))}
    </div>
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
