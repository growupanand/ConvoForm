"use client";

import BrowserWindow from "@/components/common/browserWindow";
import Spinner from "@/components/common/spinner";
import { useFormContext } from "@/components/formViewer/formContext";
import { useFormDesign } from "@/components/formViewer/formDesignContext";
import { getFormSubmissionLink } from "@/lib/url";
import { api } from "@/trpc/react";
import { FormPreview } from "./formPreview";

type Props = {
  noToolbar?: boolean;
  formId: string;
};

export default function FormPreviewBrowser({
  noToolbar,
  formId,
}: Readonly<Props>) {
  const { setCurrentSection, currentSection } = useFormContext();
  const { getCurrentSectionFormDesign } = useFormDesign();

  const activeFormDesign = getCurrentSectionFormDesign(currentSection);
  const browserPageBackgroundColor = activeFormDesign.backgroundColor;

  const {
    isLoading,
    data: form,
    refetch,
  } = api.form.getOneWithFields.useQuery({
    id: formId,
  });

  const formViewLink = form ? getFormSubmissionLink(form.id) : "";
  const refreshPreview = async () => {
    await refetch();
    setCurrentSection("landing-screen");
  };

  return (
    <BrowserWindow
      onRefresh={refreshPreview}
      link={noToolbar ? undefined : formViewLink}
      backgroundColor={browserPageBackgroundColor}
    >
      <div className="w-full h-full container">
        {isLoading ? (
          <Spinner label="Loading form..." />
        ) : (
          <FormPreview form={form} />
        )}
      </div>
    </BrowserWindow>
  );
}
