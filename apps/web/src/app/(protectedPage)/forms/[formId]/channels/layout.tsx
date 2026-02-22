import type { Metadata } from "next";

import { FormEditPageLayout } from "@/components/formEditPageLayout";
import { ChannelsSidebar } from "./_components/channelsSidebar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ formId: string }>;
};

export const metadata: Metadata = {
  title: "Channels",
};

export default async function Layout(props: Props) {
  const params = await props.params;

  const { formId } = params;

  const { children } = props;

  return (
    <FormEditPageLayout leftSidebar={<ChannelsSidebar formId={formId} />}>
      {children}
    </FormEditPageLayout>
  );
}
