import { AnimatedTypingDots } from "@/components/common/typingDots";
import { Transcript } from "@/lib/types/transcript";

type Props = {
  transcript: Transcript;
  isBusy?: boolean;
};

export default function TranscriptCard({ transcript, isBusy }: Props) {
  if (transcript.length === 0) {
    return <SystemMessageBox message="No messages yet" />;
  }
  return (
    <div className="space-y-2 ps-4">
      {transcript.map((message) => {
        return (
          <div
            key={`${message.role}-${message.content}`}
            className="flex flex-col items-start transition-all hover:scale-105"
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
  <p className="text-muted-foreground font-light">{message}</p>
);

const UserMessageBox = ({ message }: { message: string }) => (
  <p className="mb-2">{message}</p>
);
