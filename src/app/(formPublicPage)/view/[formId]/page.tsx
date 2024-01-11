import { notFound } from "next/navigation";
import { Form } from "@prisma/client";

import { FormViewer } from "@/components/formViewer/formViewer";
import prisma from "@/lib/db";

interface FormViewerPageProps {
  params: { formId: string };
}

async function getFormDetails(formId: Form["id"]) {
  return await prisma.form.findFirst({
    where: {
      id: formId,
    },
  });
}

export default async function FormViewPage({ params }: FormViewerPageProps) {
  const { formId } = params;
  const formData = await getFormDetails(formId);
  if (!formData || !formData.isPublished) {
    notFound();
  }
  return (
    <div className="relative flex min-h-screen grow flex-col items-center justify-center">
      <FormViewer form={formData} />
    </div>
  );
}
