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

type Props = {
  form: Form;
};

type State = {
  refresh: boolean;
};

export default function FormPreview({ form }: Readonly<Props>) {
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
    setState({ ...state, refresh: !state.refresh });
  };
  return (
    <BrowserWindow
      onRefresh={refreshPreview}
      actionsButton={<CopyLinkButton onClick={copyLinkToClipboard} />}
      addressBar={
        <Link href={formViewLink} target="_blank">
          <Button variant="link" size="sm" className="h-4">
            {formViewLink} <ExternalLink className="w-4 h-4 ms-2" />
          </Button>
        </Link>
      }
    >
      <div className="flex flex-col justify-center items-center h-full">
        {form.isPublished ? (
          <FormViewer form={form} refresh={refresh} isPreview={true} />
        ) : (
          <p className="text-muted-foreground">
            Publish your form to see a preview
          </p>
        )}
      </div>
    </BrowserWindow>
  );
}
