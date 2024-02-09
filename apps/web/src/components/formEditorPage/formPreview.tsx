"use client";

import { Checkbox } from "@convoform/ui/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@convoform/ui/components/ui/tooltip";

import { getFrontendBaseUrl } from "@/lib/url";
import { api } from "@/trpc/react";
import BrowserWindow from "../common/browserWindow";
import Spinner from "../common/spinner";
import { FormViewer } from "../formSubmissionPage/formViewer";

type Props = {
  noToolbar?: boolean;
  formId: string;
};

export default function FormPreview({ noToolbar, formId }: Readonly<Props>) {
  const {
    isLoading,
    data: form,
    refetch,
  } = api.form.getOne.useQuery({
    id: formId,
  });

  const formViewLink = form ? `${getFrontendBaseUrl()}/view/${form.id}` : "";
  const refreshPreview = () => refetch();

  const Toolbar = (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2">
            <Checkbox id="savePreviewSubmission" checked />
            <label
              htmlFor="savePreviewSubmission"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Save submissions in preview mode
            </label>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Cannot change in free plan</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const FormContent = () =>
    !form ? (
      <FormNotFound />
    ) : !form.isPublished ? (
      <UnpublishedForm />
    ) : (
      <FormViewer form={form} isPreview={false} />
    );

  return (
    <BrowserWindow
      onRefresh={refreshPreview}
      link={noToolbar || !form?.isPublished ? undefined : formViewLink}
      toolbar={Toolbar}
    >
      <div className="flex h-full flex-col items-center justify-center">
        {isLoading ? <Spinner label="Loading form..." /> : <FormContent />}
      </div>
    </BrowserWindow>
  );
}

const UnpublishedForm = () => (
  <p className="text-muted-foreground">Publish your form to see a preview</p>
);

const FormNotFound = () => (
  <p className="text-muted-foreground">Form not found</p>
);
