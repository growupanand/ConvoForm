import { Metadata } from "next";
import { notFound } from "next/navigation";

import { FormViewer } from "@/components/formSubmissionPage/formViewer";
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
  return (
    <div className="relative flex min-h-screen grow flex-col items-center justify-center">
      <FormViewer form={formData} />
    </div>
  );
}
