import type { Metadata } from "next";

import { FormEditorPageHeader } from "@/app/(protectedPage)/forms/[formId]/_components/formPageHeader";
import { getOrganizationId } from "@/lib/getOrganizationId";
import { api } from "@/trpc/server";
import { FormEditorProvider } from "./_components/formEditorContext";
import NotFound from "./not-found";

type Props = {
  children: React.ReactNode;
  params: { formId: string };
};

export const metadata: Metadata = {
  title: "Form editor",
};

export default async function Layout({
  children,
  params: { formId },
}: Readonly<Props>) {
  const orgId = getOrganizationId();

  const form = await api.form.getOne({ id: formId });

  if (!form || form.organizationId !== orgId) {
    return <NotFound />;
  }
  return (
    <FormEditorProvider formId={formId}>
      <div className="relative flex h-screen flex-col gap-3 ">
        <FormEditorPageHeader formId={formId} />
        <div className="grow">{children}</div>
      </div>
    </FormEditorProvider>
  );
}
