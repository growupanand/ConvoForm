import type { Metadata } from "next";

import { FormEditPageLayout } from "@/components/formEditPageLayout";
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
    <FormEditPageLayout leftSidebar={<ConversationsSidebar formId={formId} />}>
      {children}
    </FormEditPageLayout>
  );
}
