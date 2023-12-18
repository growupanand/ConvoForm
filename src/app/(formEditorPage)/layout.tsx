import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { FormEditorContextProvider } from "./context";
import FormSideBar from "@/components/formEditor/formSideBar";

async function getFormDetails(formId: string) {
  return await db.form.findFirst({
    where: {
      id: formId,
    },
    include: {
      formField: true,
    },
  });
}

type Props = {
  children: React.ReactNode;
  params: { formId: string };
};

export default async function AuthLayout({
  children,
  params,
}: Readonly<Props>) {
  const { formId } = params;
  const form = await getFormDetails(formId);
  if (!form) {
    notFound();
  }
  return (
    <FormEditorContextProvider form={form}>
      <div className="flex h-screen">
        <div className=" w-[400px] bg-gray-50 overflow-auto">
          <FormSideBar />
        </div>
        <div className="grow flex flex-col">{children}</div>
      </div>
    </FormEditorContextProvider>
  );
}
