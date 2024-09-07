"use client";

import { UserButton, useOrganization } from "@clerk/nextjs";
import { Button } from "@convoform/ui/components/ui/button";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import { ChevronRight, Home } from "lucide-react";

import { montserrat } from "@/app/fonts";
import { LinkN } from "@/components/common/linkN";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import ChangeNameInput from "./changeNameInput";

type Props = {
  formId: string;
};

function FormPageHeader({ formId }: Readonly<Props>) {
  const { organization, isLoaded: isOrganizationLoaded } = useOrganization();
  const { data, isLoading } = api.form.getOneWithWorkspace.useQuery({
    id: formId,
  });

  const canAccessForm =
    organization && data && data.organizationId === organization.id;

  if (isLoading || !isOrganizationLoaded || !canAccessForm) {
    return <FormEditorPageHeaderSkeleton />;
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between ">
        <div
          className={cn(
            "flex w-full items-center overflow-hidden pe-5 text-xs ",
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
            <Button
              size="sm"
              variant="link"
              className="text-muted-foreground hover:text-primary"
            >
              Dashboard
            </Button>
          </LinkN>
          <ChevronRight size={20} />
          {data ? (
            <>
              <LinkN href={`/workspaces/${data.workspaceId}`}>
                <Button
                  size="sm"
                  variant="link"
                  className="text-muted-foreground hover:text-primary"
                >
                  {data.workspace.name}
                </Button>
              </LinkN>
              <ChevronRight size={20} />
              <ChangeNameInput
                form={data}
                className="hover:border-input w-full text-base font-semibold ring-0 focus-visible:ring-0"
              />
            </>
          ) : (
            <span>Form not found</span>
          )}
        </div>
        <div className="flex items-center pe-5">
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
        <Skeleton className="mr-2 h-5 w-5" />
        <Skeleton className="mr-2 h-5 w-12" />
        <Skeleton className="mr-2 h-5 w-12" />
        <Skeleton className="mr-2 h-5 w-20" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 animate-pulse rounded-full" />
      </div>
    </div>
  );
};

FormPageHeader.Skeleton = FormEditorPageHeaderSkeleton;

export { FormPageHeader as FormEditorPageHeader };
