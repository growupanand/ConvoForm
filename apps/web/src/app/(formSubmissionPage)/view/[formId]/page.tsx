import { Metadata } from "next";
import { notFound } from "next/navigation";

import { FormViewer } from "@/components/formViewer";
import { api } from "@/trpc/server";

interface FormViewerPageProps {
  params: { formId: string };
}

export const metadata: Metadata = {
  title: "Submit Form",
};

export default async function FormViewPage({ params }: FormViewerPageProps) {
  const { formId } = params;
  const formData = await api.form.getOne({ id: formId });
  if (!formData || !formData.isPublished) {
    notFound();
  }

  const { showOrganizationName, organizationName } = formData;

  return (
    <div className="flex min-h-screen flex-col">
      {showOrganizationName && (
        <header className="border-b bg-white">
          <div className=" p-3 lg:container">
            <h1 className="text-xl lg:text-2xl">{organizationName}</h1>
          </div>
        </header>
      )}

      <div className="flex flex-grow items-center justify-center">
        <FormViewer form={formData} />
      </div>
    </div>
  );
}
