"use client";

import { ExternalLink } from "lucide-react";
import { FormViewer } from "../formViewer/formViewer";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { useState } from "react";
import { CopyLinkButton } from "../copyLinkButton";
import Link from "next/link";
import { Form } from "@prisma/client";
import BrowserWindow from "../ui/browserWindow";
import { Checkbox } from "../ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type Props = {
  form: Form;
  noToolbar?: boolean;
};

type State = {
  refresh: boolean;
};

export default function FormPreview({ form, noToolbar }: Readonly<Props>) {
  const formViewLink = `${window.location.origin}/view/${form.id}`;

  const [state, setState] = useState<State>({
    refresh: false,
  });
  const { refresh } = state;

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(formViewLink);
    toast({
      title: "Link copied to clipboard",
    });
  };

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
      actionsButton={
        noToolbar || <CopyLinkButton onClick={copyLinkToClipboard} />
      }
      addressBar={
        noToolbar || (
          <div>
            <Link href={formViewLink} target="_blank">
              <Button variant="link" size="sm" className="h-4">
                {formViewLink} <ExternalLink className="w-4 h-4 ms-2" />
              </Button>
            </Link>
          </div>
        )
      }
      toolbar={Toolbar}
    >
      <div className="flex flex-col justify-center items-center h-full">
        {form.isPublished ? (
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
