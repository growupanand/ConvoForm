import { Metadata } from "next";

import { FormEditorPageHeader } from "@/app/(protectedPage)/forms/[formId]/_components/formPageHeader";

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
    <div className="relative flex h-screen flex-col gap-3 ">
      <FormEditorPageHeader formId={formId} />
      <div className="grow">{children}</div>
    </div>
  );
}
