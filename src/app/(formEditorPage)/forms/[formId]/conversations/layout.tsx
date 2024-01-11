import ConversationsSidebar from "@/components/formEditor/conversationsSidebar";
import { Separator } from "@/components/ui/separator";

type Props = {
  params: { formId: string };
  children: React.ReactNode;
};

export default async function Layout(props: Props) {
  return (
    <div className="flex h-full max-lg:flex-col">
      <ConversationsSidebar />
      <Separator orientation="vertical" className="max-lg:hidden" />
      <div className="flex grow flex-col">{props.children}</div>
    </div>
  );
}
