import { FormViewer } from "@/components/formViewer/formViewer";
import prisma from "@/lib/db";
import { Form } from "@prisma/client";
import { notFound } from "next/navigation";

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
    <div className="min-h-screen relative flex flex-col grow justify-center items-center">
      <FormViewer form={formData} />
    </div>
  );
}
