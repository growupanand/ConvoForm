import Spinner from "@/components/common/spinner";
import { isConversationInProgress } from "@/lib/conversationStatus";
import type { Conversation } from "@convoform/db/src/schema";
import { Badge } from "@convoform/ui";

type StatusBadgeProps = {
  conversation: Pick<
    Conversation,
    "finishedAt" | "isInProgress" | "updatedAt" | "channelType"
  >;
};

export function ConversationStatusBadge({
  conversation,
}: Readonly<StatusBadgeProps>) {
  if (conversation.finishedAt) {
    return <Badge variant="default">Finished</Badge>;
  }

  if (isConversationInProgress(conversation)) {
    return (
      <Badge variant="outline">
        <Spinner size="sm" className="me-2" />
        In progress
      </Badge>
    );
  }

  return <Badge variant="secondary">Abandoned</Badge>;
}
