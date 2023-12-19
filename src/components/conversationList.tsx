import { Conversation, Form } from "@prisma/client";
import { Button } from "./ui/button";
import { FileText } from "lucide-react";
import { formatDate, timeAgo } from "@/lib/utils";
import Link from "next/link";

type Props = {
  formId: string;
  conversations: Pick<Conversation, "id" | "name" | "createdAt">[];
};

export default function ConversationList(props: Props) {
  const { conversations, formId } = props;
  return (
    <div className="flex flex-col">
      {conversations.map((conversation) => (
        <div key={conversation.id} className="text-ellipsis overflow-hidden">
          <Link href={`/forms/${formId}/conversations/${conversation.id}`}>
            <Button
              variant="link"
              className="w-full justify-between hover:no-underline text-gray-500 hover:text-gray-800"
            >
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-3" />
                <span>{conversation.name}</span>
              </div>
              <span>{timeAgo(conversation.createdAt.toDateString())}</span>
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
