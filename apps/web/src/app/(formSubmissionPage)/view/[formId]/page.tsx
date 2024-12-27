import { formSubmissionSchema } from "@convoform/db/src/schema";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FormViewer } from "@/components/formViewer";
import { FormContextProvider } from "@/components/formViewer/formContext";
import { api } from "@/trpc/server";
import { FormDesignLayout } from "./_components/formDesignLayout";
import { FormNotPublishedScreen } from "./_components/formNotPublishedScreen";
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

  if (!formData || !isValidForm) {
    notFound();
  }

  if (!formData.isPublished) {
    return <FormNotPublishedScreen />;
  }

  const { showOrganizationName, showOrganizationLogo } = formData;
  const showHeader = showOrganizationName || showOrganizationLogo;

  return (
    <FormContextProvider form={formData}>
      <FormDesignLayout>
        <div className="min-h-screen flex flex-col">
          {showHeader && <FormSubmissionPageHeader form={formData} />}
          <div className="flex flex-grow items-center justify-center relative">
            <FormViewer />
          </div>
        </div>
      </FormDesignLayout>
    </FormContextProvider>
  );
}
