import { Metadata } from "next";

import ConversationsSidebar from "@/components/formEditor/conversationsSidebar";

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
      <div className="lg:w-[400px] lg:min-w-[400px]">
        <ConversationsSidebar />
      </div>
      <div className="flex grow flex-col border-l bg-white">
        {props.children}
      </div>
    </div>
  );
}
