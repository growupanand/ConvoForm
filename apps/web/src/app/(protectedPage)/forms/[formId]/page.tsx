"use client";
import { Suspense, use } from "react";

import { useOrganization } from "@clerk/nextjs";
import { Card, Skeleton } from "@convoform/ui";

import {
  FormEditorCard,
  FormEditorFormSkeleton,
} from "@/app/(protectedPage)/forms/[formId]/_components/formEditor/formEditorCard";
import FormPreviewBrowser from "@/app/(protectedPage)/forms/[formId]/_components/formEditor/formPreviewBrowser";
import MainNavTab from "@/app/(protectedPage)/forms/[formId]/_components/mainNavTab";
import { FormEditPageLayout } from "@/components/formEditPageLayout";
import { FormContextProvider } from "@/components/formViewer/formContext";
import { api } from "@/trpc/react";
import { FormDesignEditor } from "./_components/formDesignEditor";
import NotFound from "./not-found";

type Props = {
  params: Promise<{ formId: string }>;
};

export default function FormPage(props: Props) {
  const params = use(props.params);
  const { formId } = params;

  return (
    <Suspense fallback={<FormPageLoading formId={formId} />}>
      <FormPageContent formId={formId} />
    </Suspense>
  );
}

function FormPageContent({ formId }: { formId: string }) {
  const { organization, isLoaded } = useOrganization();
  const [data] = api.form.getOneWithFields.useSuspenseQuery(
    {
      id: formId,
    },
    {
      // throwOnError: false,
    },
  );

  if (!isLoaded) {
    return <FormPageLoading formId={formId} />;
  }

  if (!data || !organization) {
    return <NotFound />;
  }

  return (
    <FormContextProvider form={data}>
      <FormEditPageLayout
        leftSidebar={
          <div className="h-full w-full flex flex-col space-y-4">
            <MainNavTab formId={formId} />
            <div className="relative grow overflow-auto">
              <Card className="  border-0 bg-transparent shadow-none">
                <FormEditorCard form={data} organization={organization} />
              </Card>
            </div>
          </div>
        }
        rightSidebar={
          <FormDesignEditor organizationId={organization.id} formId={formId} />
        }
      >
        <FormPreviewBrowser formId={formId} />
      </FormEditPageLayout>
    </FormContextProvider>
  );
}

function FormPageLoading({ formId }: { formId: string }) {
  return (
    <FormEditPageLayout
      leftSidebar={
        <div className="flex h-full w-full flex-col space-y-4">
          <MainNavTab formId={formId} />
          <div className="relative grow overflow-auto">
            <Card className="border-0 bg-transparent shadow-none">
              <FormEditorFormSkeleton />
            </Card>
          </div>
        </div>
      }
      rightSidebar={<FormDesignEditor.Skeleton />}
    >
      <Skeleton className="h-full w-full " />
    </FormEditPageLayout>
  );
}
