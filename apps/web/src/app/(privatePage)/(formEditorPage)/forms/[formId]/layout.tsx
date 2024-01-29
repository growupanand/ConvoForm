import { FormEditorPageHeader } from "@/components/formEditorPage/formEditorPageHeader";

type Props = {
  children: React.ReactNode;
  params: { formId: string };
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
