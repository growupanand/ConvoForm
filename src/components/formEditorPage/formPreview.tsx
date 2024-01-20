"use client";

import { useState } from "react";
import { useAtom } from "jotai";

import { currentFormAtom } from "@/lib/atoms/formAtoms";
import { getFrontendBaseUrl } from "@/lib/url";
import BrowserWindow from "../common/browserWindow";
import { FormViewer } from "../formSubmissionPage/formViewer";
import { Checkbox } from "../ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type Props = {
  noToolbar?: boolean;
};

type State = {
  refresh: boolean;
};

export default function FormPreview({ noToolbar }: Readonly<Props>) {
  const [state, setState] = useState<State>({
    refresh: false,
  });
  const { refresh } = state;

  const [form] = useAtom(currentFormAtom);

  const formViewLink = form ? `${getFrontendBaseUrl()}/view/${form.id}` : "";
  const refreshPreview = () => {
    setState((cs) => ({ ...cs, refresh: !cs.refresh }));
  };

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

  return (
    <BrowserWindow
      onRefresh={refreshPreview}
      link={noToolbar || !form?.isPublished ? undefined : formViewLink}
      toolbar={Toolbar}
    >
      <div className="flex h-full flex-col items-center justify-center">
        {form?.isPublished ? (
          <FormViewer form={form} refresh={refresh} isPreview={false} />
        ) : (
          <p className="text-muted-foreground">
            Publish your form to see a preview
          </p>
        )}
      </div>
    </BrowserWindow>
  );
}
