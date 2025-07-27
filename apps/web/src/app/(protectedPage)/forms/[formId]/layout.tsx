import type { Metadata } from "next";

import { FormEditorPageHeader } from "@/app/(protectedPage)/forms/[formId]/_components/formPageHeader";
import { getOrganizationIdOrRedirect } from "@/lib/getOrganizationId";
import { api } from "@/trpc/server";
import NotFound from "./not-found";

type Props = {
  children: React.ReactNode;
  params: Promise<{ formId: string }>;
};

export const metadata: Metadata = {
  title: "Form editor",
};

export default async function Layout(props: Readonly<Props>) {
  const params = await props.params;

  const { formId } = params;

  const { children } = props;

  const orgId = await getOrganizationIdOrRedirect();

  const form = await api.form.getOne({ id: formId });

  if (!form || form.organizationId !== orgId) {
    return <NotFound />;
  }
  return (
    <div className="absolute inset-0  h-screen overflow-y-auto flex flex-col items-stretch gap-y-4 pb-6">
      <div className="my-4 mx-6 ">
        <FormEditorPageHeader formId={formId} />
      </div>
      <div className="grow relative">{children}</div>
    </div>
  );
}
