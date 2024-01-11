import { Transcript } from "@/lib/types/transcript";

type Props = {
  transcript: Transcript;
};

export default function TranscriptCard({ transcript }: Props) {
  if (transcript.length === 0) {
    return <SystemMessageBox message="No messages yet" />;
  }
  return (
    <div className="space-y-2 ps-4">
      {transcript.map((message) => {
        return (
          <div
            key={`${message.role}-${message.content}`}
            className="flex flex-col items-start "
          >
            {message.role === "user" ? (
              <UserMessageBox message={message.content} />
            ) : (
              <SystemMessageBox message={message.content} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const SystemMessageBox = ({ message }: { message: string }) => (
  <p className="font-light text-muted-foreground ">{message}</p>
);

const UserMessageBox = ({ message }: { message: string }) => (
  <p className="mb-2">{message}</p>
);
