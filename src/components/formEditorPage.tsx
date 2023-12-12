"use client";

import { Form, Journey } from "@prisma/client";
import { AppNavbarButton } from "@/components/appNavbar/appNavbarButton";
import BrandName from "@/components/brandName";
import FormEditor from "@/components/formEditor";
import { FormViewer } from "@/components/formViewer/formViewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { Copy, ExternalLink, RotateCw } from "lucide-react";
import { toast } from "./ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type Props = {
  form: Form & {
    journey: Journey[];
  };
};

type State = {
  form: Form & {
    journey: Journey[];
  };
  refresh: boolean;
};

export const FormEditorPage = (props: Props) => {
  const [state, setState] = useState<State>({
    form: props.form,
    refresh: false,
  });
  const { form, refresh } = state;
  const formViewLink = `${window.location.origin}/view/${form.id}`;

  const onUpdateForm = (updatedForm: Form & { journey: Journey[] }) => {
    setState({ ...state, form: updatedForm, refresh: !state.refresh });
  };

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
    <div className="flex h-screen">
      <div className=" w-[400px] bg-gray-50 overflow-auto">
        <div className="flex justify-between items-center sticky top-0 p-3 bg-gray-50/75 backdrop-blur-md">
          <AppNavbarButton />
          <BrandName />
          <Link href={`/workspaces/${form.workspaceId}`}>
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
        <Card className="bg-transparent border-0 shadow-none">
          <CardContent className="pt-3">
            <FormEditor form={form} onUpdated={onUpdateForm} />
          </CardContent>
        </Card>
      </div>
      <div className="grow flex flex-col">
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
          <CopyButton onClick={copyLinkToClipboard} />
        </div>
        <div className="relative grow flex flex-col justify-center items-center">
          <FormViewer form={form} refresh={refresh} isPreview={true} />
        </div>
      </div>
    </div>
  );
};

const CopyButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={onClick}>
            <Copy className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy link</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
