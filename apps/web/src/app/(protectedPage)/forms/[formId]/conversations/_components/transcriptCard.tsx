import type { Transcript } from "@convoform/db/src/schema";

import { AnimatedTypingDots } from "@/components/common/typingDots";
import { Skeleton } from "@convoform/ui";

type Props = {
  transcript: Transcript[];
  isBusy?: boolean;
};

export default function TranscriptCard({ transcript, isBusy }: Props) {
  if (transcript.length === 0) {
    return <SystemMessageBox message="No messages yet" />;
  }
  return (
    <div className="space-y-1 ps-4">
      {transcript.map((message) => {
        return (
          <div
            key={`${message.role}-${message.content}`}
            className="flex flex-col items-start"
          >
            {message.role === "user" ? (
              <UserMessageBox message={message.content} />
            ) : (
              <SystemMessageBox message={message.content} />
            )}
          </div>
        );
      })}
      {isBusy && (
        <div className="pt-2">
          <AnimatedTypingDots size="xxs" />
        </div>
      )}
    </div>
  );
}

const SystemMessageBox = ({ message }: { message: string }) => (
  <p className="text-muted-foreground font-light ">{message}</p>
);

const UserMessageBox = ({ message }: { message: string }) => (
  <p className="mb-4 ">{message}</p>
);

const SystemMessageSkeleton = () => <Skeleton className="h-2 w-40 bg-muted " />;

const UserMessageSkeleton = () => (
  <Skeleton className="h-2 w-20 bg-muted-foreground " />
);

const TranscriptCardSkeleton = () => (
  <div className="space-y-2 ps-4">
    <UserMessageSkeleton />
    <SystemMessageSkeleton />
  </div>
);

TranscriptCard.Skeleton = TranscriptCardSkeleton;
