import type { Transcript } from "@convoform/db/src/schema";

import { AnimatedTypingDots } from "@/components/common/typingDots";
import { cn } from "@/lib/utils";
import { Skeleton } from "@convoform/ui";

type Props = {
  transcript: Transcript[];
  isBusy?: boolean;
  className?: HTMLElement["className"];
};

export default function TranscriptCard({
  transcript,
  isBusy,
  className,
}: Props) {
  if (transcript.length === 0) {
    return <SystemMessageBox message="No messages yet" />;
  }

  // Hide opening message ("Hi") from transcript if found
  const cleanedTranscript =
    transcript[0]?.content === "Hi" ? transcript.slice(1) : transcript;

  return (
    <div className={cn("text-base font-normal", className)}>
      {cleanedTranscript.map((message, index) => {
        return (
          <div
            key={`${message.role}-${message.content}`}
            className="flex flex-col items-start"
          >
            {message.role === "user" ? (
              <UserMessageBox message={message.content} />
            ) : (
              <SystemMessageBox
                message={message.content}
                isFirst={index === 0}
              />
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

const SystemMessageBox = ({
  message,
  isFirst,
}: { message: string; isFirst?: boolean }) => (
  <p className={cn("text-subtle-foreground", isFirst ? "pb-2" : "py-2")}>
    {message}
  </p>
);

const UserMessageBox = ({ message }: { message: string }) => (
  <p className="mb-4 font-medium text-foreground pb-1">{message}</p>
);

const SystemMessageSkeleton = () => (
  <Skeleton className="h-4 w-40 bg-gray-200 " />
);

const UserMessageSkeleton = () => <Skeleton className="h-4 w-20" />;

const TranscriptCardSkeleton = () => (
  <div className="space-y-2 ps-4">
    <SystemMessageSkeleton />
    <UserMessageSkeleton />
    <SystemMessageSkeleton />
    <UserMessageSkeleton />
  </div>
);

TranscriptCard.Skeleton = TranscriptCardSkeleton;
