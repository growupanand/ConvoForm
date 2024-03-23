import { Metadata } from "next";
import Image from "next/image";
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

  const {
    showOrganizationName,
    organizationName,
    showOrganizationLogo,
    organizationLogoUrl,
  } = formData;

  const showHeader = showOrganizationName || showOrganizationLogo;

  return (
    <div className="flex min-h-screen flex-col">
      {showHeader && (
        <header className="border-b bg-white">
          <div className=" flex items-center justify-start gap-3 p-3 lg:container">
            {showOrganizationLogo && organizationLogoUrl && (
              <Image
                alt="Organization Logo"
                src={organizationLogoUrl}
                width={30}
                height={30}
              />
            )}
            {showOrganizationName && organizationName && (
              <h1 className="text-xl lg:text-2xl">{organizationName}</h1>
            )}
          </div>
        </header>
      )}

      <div className="flex flex-grow items-center justify-center">
        <FormViewer form={formData} />
      </div>
    </div>
  );
}
