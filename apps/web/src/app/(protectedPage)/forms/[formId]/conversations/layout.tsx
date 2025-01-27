import type { Metadata } from "next";

import { ConversationsSidebar } from "./_components/conversationsSidebar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ formId: string }>;
};

export const metadata: Metadata = {
  title: "Responses",
};

export default async function Layout(props: Props) {
  const params = await props.params;

  const { formId } = params;

  const { children } = props;

  return (
    <div className="flex h-full">
      <div className="w-[400px] min-w-[400px]">
        <ConversationsSidebar formId={formId} />
      </div>
      <div className="p-3 grow container ms-0">{children}</div>
    </div>
  );
}
