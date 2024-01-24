"use client";

import { UserButton } from "@clerk/nextjs";
import { Form, Workspace } from "@prisma/client";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";

import { montserrat } from "@/app/fonts";
import { LinkN } from "@/components/common/linkN";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import FormNameInput from "./formNameInput";

type Props = {
  form: Form;
  formId: string;
  workspace: Workspace;
};

function FormEditorPageHeader({ form, workspace }: Props) {
  return (
    <div className="sticky top-0 z-50 border-b bg-white/70 p-3 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between ">
        <div
          className={cn(
            "flex w-full items-center overflow-hidden text-xs max-lg:hidden",
            montserrat.className,
          )}
        >
          <Button size="sm" variant="link" asChild>
            <LinkN href={"/dashboard"}>
              <Home size={20} />
            </LinkN>
          </Button>
          <ChevronRight size={20} />
          <LinkN href={"/dashboard"}>
            <Button size="sm" variant="link">
              Dashboard
            </Button>
          </LinkN>
          <ChevronRight size={20} />
          <LinkN href={`/workspaces/${form.workspaceId}`}>
            <Button size="sm" variant="link">
              {workspace.name}
            </Button>
          </LinkN>
          <ChevronRight size={20} />
          <FormNameInput form={form} className="w-full text-xl font-medium" />
        </div>
        <div className="lg:hidden">
          <LinkN href={`/workspaces/${form.workspaceId}`}>
            <Button size="sm" variant="link" className="px-0 text-sm">
              <ChevronLeft className="mr-2" size={20} />
              Back
            </Button>
          </LinkN>
        </div>
        <div className="overflow-hidden lg:hidden">
          <FormNameInput form={form} className="text-xl font-medium" />
        </div>
        <div className="flex items-center gap-2">
          <UserButton />
        </div>
      </div>
    </div>
  );
}

const FormEditorPageHeaderSkeleton = () => {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/40 bg-white p-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center ">
        <Skeleton className="mr-2 h-[40px] w-12" />
        <Skeleton className="mr-2 h-[40px] w-12" />
        <Skeleton className="mr-2 h-[40px] w-12" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="mr-2 h-[40px] w-12" />
        <Skeleton className="mr-2 h-[40px] w-12" />
      </div>
    </div>
  );
};

FormEditorPageHeader.Skeleton = FormEditorPageHeaderSkeleton;

export { FormEditorPageHeader };
