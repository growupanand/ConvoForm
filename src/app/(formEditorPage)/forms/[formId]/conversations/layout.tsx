import ConversationsCard from "@/components/formEditor/conversationsCard";
import { db } from "@/lib/db";
import { Form } from "@prisma/client";
import { redirect } from "next/navigation";

type Props = {
  params: { formId: string; conversationId: string };
  children: React.ReactNode;
};

export const getFormConversations = async (formId: Form["id"]) => {
  return await db.conversation.findMany({
    where: {
      formId,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export default async function Layout(props: Props) {
  const { formId } = props.params;
  const conversations = await getFormConversations(formId);

  return (
    <div className="flex h-full">
      <div className=" w-[400px] bg-gray-50 overflow-auto">
        <ConversationsCard conversations={conversations} formId={formId} />
      </div>
      <div className="grow flex flex-col">{props.children}</div>
    </div>
  );
}
