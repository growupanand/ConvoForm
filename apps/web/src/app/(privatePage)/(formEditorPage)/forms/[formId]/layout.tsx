import { notFound } from "next/navigation";
import { api } from "@convoform/api/trpc/server";

import { FormEditorPageHeader } from "@/components/formEditorPage/formEditorPageHeader";
import { getFormController } from "@/lib/controllers/form";
import Provider from "./provider";

type Props = {
  children: React.ReactNode;
  params: { formId: string };
};

export default async function Layout({
  children,
  params: { formId },
}: Readonly<Props>) {
  const form = await getFormController(formId);
  if (!form) {
    notFound();
  }
  const workspace = await api.workspace.getOne.query({
    id: form.workspaceId,
  });
  if (!workspace) {
    notFound();
  }

  return (
    <Provider form={form} workspace={workspace}>
      <div className="relative flex h-screen flex-col ">
        <FormEditorPageHeader
          formId={formId}
          form={form}
          workspace={workspace}
        />
        <div className="grow">{children}</div>
      </div>
    </Provider>
  );
}
