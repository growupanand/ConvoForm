import type { Metadata } from "next";

import { FormEditPageLayout } from "@/components/formEditPageLayout";
import { SettingsSidebar } from "./_components/settingsSidebar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ formId: string }>;
};

export const metadata: Metadata = {
  title: "Settings",
};

export default async function Layout(props: Props) {
  const params = await props.params;

  const { formId } = params;

  const { children } = props;

  return (
    <FormEditPageLayout leftSidebar={<SettingsSidebar formId={formId} />}>
      {children}
    </FormEditPageLayout>
  );
}
