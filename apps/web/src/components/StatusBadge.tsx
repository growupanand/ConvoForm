import { Badge } from "@convoform/ui";
import Spinner from "@/components/common/spinner";
import type { Conversation } from "@convoform/db/src/schema";

type StatusBadgeProps = {
  conversation: Pick<Conversation, "finishedAt" | "isInProgress">;
};

export function ConversationStatusBadge({
  conversation,
}: Readonly<StatusBadgeProps>) {
  if (conversation.finishedAt) {
    return <Badge variant="default">Finished</Badge>;
  }

  if (conversation.isInProgress) {
    return (
      <Badge variant="outline">
        <Spinner size="sm" className="me-2" />
        In progress
      </Badge>
    );
  }

  return <Badge variant="secondary">Incomplete</Badge>;
}
