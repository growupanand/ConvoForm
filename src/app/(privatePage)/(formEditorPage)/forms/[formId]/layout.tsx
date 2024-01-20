import { notFound } from "next/navigation";

import { FormEditorPageHeader } from "@/components/formEditorPage/formEditorPageHeader";
import { getFormController } from "@/lib/controllers/form";
import { getWorkspaceController } from "@/lib/controllers/workspace";
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
  const workspace = await getWorkspaceController(form.workspaceId);
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
