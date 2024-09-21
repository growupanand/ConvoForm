"use client";

import BrowserWindow from "@/components/common/browserWindow";
import Spinner from "@/components/common/spinner";
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
  const { setCurrentSection, activeFormDesign } = useFormDesign();
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

  // const Toolbar = (
  //   <Tooltip>
  //     <TooltipTrigger asChild>
  //       <div className="flex items-center space-x-2">
  //         <Checkbox id="savePreviewSubmission" checked />
  //         <label
  //           htmlFor="savePreviewSubmission"
  //           className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  //         >
  //           Save response in preview mode
  //         </label>
  //       </div>
  //     </TooltipTrigger>
  //     <TooltipContent side="right">
  //       <p>Cannot change in free plan</p>
  //     </TooltipContent>
  //   </Tooltip>
  // );

  return (
    <BrowserWindow
      onRefresh={refreshPreview}
      link={noToolbar ? undefined : formViewLink}
      // toolbar={Toolbar}
      backgroundColor={browserPageBackgroundColor}
    >
      <div className="flex h-full flex-col items-center justify-center">
        {isLoading ? (
          <Spinner label="Loading form..." />
        ) : (
          <FormPreview form={form} />
        )}
      </div>
    </BrowserWindow>
  );
}
