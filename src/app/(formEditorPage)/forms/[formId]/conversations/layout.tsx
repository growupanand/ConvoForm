import ConversationsSidebar from "@/components/formEditor/conversationsSidebar";
import { Separator } from "@/components/ui/separator";

type Props = {
  params: { formId: string };
  children: React.ReactNode;
};

export default async function Layout(props: Props) {
  return (
    <div className="flex max-lg:flex-col h-full">
      <ConversationsSidebar />
      <Separator orientation="vertical" className="max-lg:hidden" />
      <div className="grow flex flex-col">{props.children}</div>
    </div>
  );
}
