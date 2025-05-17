"use client";

import { UserButton, useOrganization } from "@clerk/nextjs";
import { Button } from "@convoform/ui";
import { Skeleton } from "@convoform/ui";
import { ChevronRight, Home } from "lucide-react";

import { LinkN } from "@/components/common/linkN";
import { api } from "@/trpc/react";
import ChangeNameInput from "./changeNameInput";
import { FormPublishToggle } from "./formPublishToggle";

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
    <div className="flex items-center justify-between gap-x-4">
      <div className="inline-flex grow items-center">
        <Button size="sm" variant="link" asChild>
          <LinkN href={"/dashboard"}>
            <Home size={20} />
          </LinkN>
        </Button>
        <ChevronRight className="size-5" />
        {data ? (
          <>
            <LinkN href={`/workspaces/${data.workspaceId}`}>
              <Button
                variant="link"
                className="text-base text-muted-foreground hover:text-primary"
              >
                <span className="workspace-name">{data.workspace.name}</span>
              </Button>
            </LinkN>
            <ChevronRight className="size-5" />
            <ChangeNameInput form={data} className="ms-2 text-base" />
          </>
        ) : (
          <span>Form not found</span>
        )}
      </div>

      <div className="flex items-center justify-end gap-x-4 pe-6">
        <FormPublishToggle form={data} />
        <UserButton />
      </div>
    </div>
  );
}

const FormEditorPageHeaderSkeleton = () => {
  return (
    <div className="flex items-center justify-between gap-x-4">
      <div className="inline-flex grow items-center">
        <Skeleton className="size-5" />
        <Skeleton className="mx-2 size-5" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mx-2 size-5" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="flex items-center justify-end gap-x-4 pe-6">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="size-8 rounded-full" />
      </div>
    </div>
  );
};

FormPageHeader.Skeleton = FormEditorPageHeaderSkeleton;

export { FormPageHeader as FormEditorPageHeader };
