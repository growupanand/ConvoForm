import { Metadata } from "next";

import ConversationsSidebar from "@/components/formEditor/conversationsSidebar";
import { Separator } from "@/components/ui/separator";

type Props = {
  params: { formId: string };
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Form Conversations",
};

export default async function Layout(props: Props) {
  return (
    <div className="flex h-full max-lg:flex-col">
      <ConversationsSidebar />
      <Separator orientation="vertical" className="max-lg:hidden" />
      <div className="flex grow flex-col bg-white">{props.children}</div>
    </div>
  );
}
