import ConversationsCard from "@/components/formEditor/conversationsCard";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { Form } from "@prisma/client";

type Props = {
  params: { formId: string };
  children: React.ReactNode;
};

const getFormConversations = async (formId: Form["id"]) => {
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
      <div className=" min-w-[300px] w-[400px]">
        <ConversationsCard conversations={conversations} formId={formId} />
      </div>
      <Separator orientation="vertical" />
      <div className="grow flex flex-col">{props.children}</div>
    </div>
  );
}
