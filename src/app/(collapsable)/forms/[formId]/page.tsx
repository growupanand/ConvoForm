import { FormEditorPage } from "@/components/formEditorPage";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface FormPageProps {
  params: { formId: string };
}

async function getFormDetails(formId: string) {
  return await db.form.findFirst({
    where: {
      id: formId,
    },
    include: {
      journey: true,
    },
  });
}

export default async function NewFormPage({ params }: FormPageProps) {
  const { formId } = params;
  const form = await getFormDetails(formId);
  if (!form) {
    notFound();
  }

  return <FormEditorPage form={form} />;
}
