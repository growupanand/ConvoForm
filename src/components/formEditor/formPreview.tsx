"use client";

import { RotateCw, ExternalLink } from "lucide-react";
import { FormViewer } from "../formViewer/formViewer";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { useState } from "react";
import { CopyLinkButton } from "../copyLinkButton";
import Link from "next/link";
import { Form } from "@prisma/client";

type Props = {
  form: Form;
};

type State = {
  refresh: boolean;
};

export default function FormPreview({ form }: Props) {
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
    <>
      <div className="p-3 flex items-center  gap-3">
        <div className="bg-gray-300 rounded-lg flex items-center gap-1 p-1">
          <Button variant="ghost" size="icon" onClick={refreshPreview}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Link href={formViewLink} target="_blank">
            <Button variant="link">
              {formViewLink} <ExternalLink className="w-4 h-4 ms-2" />
            </Button>
          </Link>
        </div>
        <CopyLinkButton onClick={copyLinkToClipboard} />
      </div>
      <div className="relative grow flex flex-col justify-center items-center">
        <FormViewer form={form} refresh={refresh} isPreview={true} />
      </div>
    </>
  );
}
