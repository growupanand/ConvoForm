import type { Metadata } from "next";

import { FormEditPageLayout } from "@/components/formEditPageLayout";
import { IntegrationsSidebar } from "./_components/integrationsSidebar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ formId: string }>;
};

export const metadata: Metadata = {
  title: "Integrations",
};

export default async function Layout(props: Props) {
  const params = await props.params;

  const { formId } = params;

  const { children } = props;

  return (
    <FormEditPageLayout leftSidebar={<IntegrationsSidebar formId={formId} />}>
      {children}
    </FormEditPageLayout>
  );
}
