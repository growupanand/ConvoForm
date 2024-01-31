"use client";

import { UserButton } from "@clerk/nextjs";
import { Button } from "@convoform/ui/components/ui/button";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";

import { montserrat } from "@/app/fonts";
import { LinkN } from "@/components/common/linkN";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/client";
import FormNameInput from "./formNameInput";

type Props = {
  formId: string;
};

function FormEditorPageHeader({ formId }: Props) {
  const { data, isLoading } = api.form.getOneWithWorkspace.useQuery({
    id: formId,
  });

  if (isLoading) {
    return <FormEditorPageHeaderSkeleton />;
  }

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
          {data ? (
            <>
              <LinkN href={`/workspaces/${data.workspaceId}`}>
                <Button size="sm" variant="link">
                  {data.workspace.name}
                </Button>
              </LinkN>
              <ChevronRight size={20} />
              <FormNameInput
                form={data}
                className="w-full text-xl font-medium"
              />
            </>
          ) : (
            <span>Form not found</span>
          )}
        </div>
        <div className="lg:hidden">
          <LinkN href={data ? `/workspaces/${data.workspaceId}` : "/dashboard"}>
            <Button size="sm" variant="link" className="px-0 text-sm">
              <ChevronLeft className="mr-2" size={20} />
              Back
            </Button>
          </LinkN>
        </div>
        <div className="overflow-hidden lg:hidden">
          {data ? (
            <FormNameInput form={data} className="text-xl font-medium" />
          ) : (
            <span>Form not found</span>
          )}
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
    <div className="border-border/40 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex items-center justify-between border-b bg-white p-3 backdrop-blur">
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
