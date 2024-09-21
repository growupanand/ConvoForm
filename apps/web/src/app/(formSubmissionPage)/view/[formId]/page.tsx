import { formSubmissionSchema } from "@convoform/db/src/schema";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FormViewer } from "@/components/formViewer";
import { api } from "@/trpc/server";
import { FormDesignLayout } from "./_components/formDesignLayout";
import { FormSubmissionPageHeader } from "./_components/header";

interface FormViewerPageProps {
  params: { formId: string };
}

export const metadata: Metadata = {
  title: "Submit Form",
};

export default async function FormViewPage({
  params,
}: Readonly<FormViewerPageProps>) {
  const { formId } = params;
  const formData = await api.form.getOneWithFields({ id: formId });

  const isValidForm = formSubmissionSchema.safeParse(formData).success;

  if (!formData || !formData.isPublished || !isValidForm) {
    notFound();
  }

  const { showOrganizationName, showOrganizationLogo } = formData;
  const showHeader = showOrganizationName || showOrganizationLogo;

  return (
    <FormDesignLayout>
      <div className="min-h-screen flex flex-col">
        {showHeader && <FormSubmissionPageHeader form={formData} />}

        <div className="flex flex-grow items-center justify-center">
          <FormViewer form={formData} />
        </div>
      </div>
    </FormDesignLayout>
  );
}
