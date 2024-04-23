"use client";

import { Checkbox } from "@convoform/ui/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@convoform/ui/components/ui/tooltip";

import BrowserWindow from "@/components/common/browserWindow";
import Spinner from "@/components/common/spinner";
import { FormViewer } from "@/components/formViewer/formViewer";
import { getFrontendBaseUrl } from "@/lib/url";
import { formUpdateSchema } from "@/lib/validations/form";
import { api } from "@/trpc/react";

type Props = {
  noToolbar?: boolean;
  formId: string;
};

export default function FormPreview({ noToolbar, formId }: Readonly<Props>) {
  const {
    isLoading,
    data: form,
    refetch,
  } = api.form.getOneWithFields.useQuery({
    id: formId,
  });

  const formViewLink = form ? `${getFrontendBaseUrl()}/view/${form.id}` : "";
  const refreshPreview = () => refetch();
  const isValidForm = formUpdateSchema.safeParse(form).success;

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
              Save response in preview mode
            </label>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Cannot change in free plan</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <BrowserWindow
      onRefresh={refreshPreview}
      link={noToolbar ? undefined : formViewLink}
      toolbar={Toolbar}
    >
      <div className="flex h-full flex-col items-center justify-center">
        {isLoading ? (
          <Spinner label="Loading form..." />
        ) : (
          <FormContent form={form} isValidForm={isValidForm} />
        )}
      </div>
    </BrowserWindow>
  );
}

const FormContent = ({
  form,
  isValidForm,
}: {
  form: any;
  isValidForm: boolean;
}) => {
  if (!form) {
    return <FormNotFound />;
  }
  if (!isValidForm) {
    return <InvalidForm />;
  }
  return <FormViewer form={form} isPreview={false} />;
};

const InvalidForm = () => (
  <p className="text-muted-foreground">
    Unable to preview form, Please check all form details are filled.
  </p>
);

const FormNotFound = () => (
  <p className="text-muted-foreground">Form not found</p>
);
