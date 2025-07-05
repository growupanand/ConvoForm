"use client";

import { UserButton, useOrganization } from "@clerk/nextjs";
import { Button, Skeleton } from "@convoform/ui";
import { ArrowLeft } from "lucide-react";

import { LinkN } from "@/components/common/linkN";
import { api } from "@/trpc/react";
import ChangeNameInput from "./changeNameInput";
import { FormPublishToggle } from "./formPublishToggle";

type Props = {
  formId: string;
};

function FormPageHeader({ formId }: Readonly<Props>) {
  const { organization, isLoaded: isOrganizationLoaded } = useOrganization();
  const { data, isLoading } = api.form.getOne.useQuery({
    id: formId,
  });

  const canAccessForm =
    organization && data && data.organizationId === organization.id;

  if (isLoading || !isOrganizationLoaded || !canAccessForm) {
    return <FormEditorPageHeaderSkeleton />;
  }

  return (
    <div className="flex items-center justify-between gap-x-4">
      <div className="flex items-center gap-x-4 flex-1">
        <Button size="sm" variant="ghost" asChild>
          <LinkN href="/forms">
            <ArrowLeft size={16} className="me-2" />
            <span>Forms</span>
          </LinkN>
        </Button>
        {data ? (
          <div className="flex-1">
            <ChangeNameInput form={data} className="text-base w-full" />
          </div>
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
