import { FormViewer } from "@/components/formViewer/formViewer";
import { db } from "@/lib/db";
import { Form } from "@prisma/client";
import { notFound } from "next/navigation";

interface FormViewerPageProps {
  params: { formId: string };
}

async function getFormDetails(formId: Form["id"]) {
  return await db.form.findFirst({
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
    <div className="min-h-screen">
      <FormViewer form={formData} />
    </div>
  );
}
