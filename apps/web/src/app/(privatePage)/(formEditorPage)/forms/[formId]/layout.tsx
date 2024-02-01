import { Metadata } from "next";

import { FormEditorPageHeader } from "@/components/formEditorPage/formEditorPageHeader";

type Props = {
  children: React.ReactNode;
  params: { formId: string };
};

export const metadata: Metadata = {
  title: "Form editor",
};

export default function Layout({
  children,
  params: { formId },
}: Readonly<Props>) {
  return (
    <div className="relative flex h-screen flex-col ">
      <FormEditorPageHeader formId={formId} />
      <div className="grow">{children}</div>
    </div>
  );
}
