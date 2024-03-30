import { Metadata } from "next";
import { notFound } from "next/navigation";

import { FormViewer } from "@/components/formViewer/formViewer";
import { api } from "@/trpc/server";
import { FormSubmissionPageHeader } from "./_components/header";

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

  const { showOrganizationName, showOrganizationLogo } = formData;
  const showHeader = showOrganizationName || showOrganizationLogo;

  return (
    <div className="flex min-h-screen flex-col">
      {showHeader && <FormSubmissionPageHeader form={formData} />}

      <div className="flex flex-grow items-center justify-center">
        <FormViewer form={formData} />
      </div>
    </div>
  );
}
