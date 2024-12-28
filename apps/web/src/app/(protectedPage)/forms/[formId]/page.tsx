"use client";

import { useOrganization } from "@clerk/nextjs";
import { Card, CardContent } from "@convoform/ui/components/ui/card";

import {
  FormEditorCard,
  FormEditorFormSkeleton,
} from "@/app/(protectedPage)/forms/[formId]/_components/formEditor/formEditorCard";
import FormPreviewBrowser from "@/app/(protectedPage)/forms/[formId]/_components/formEditor/formPreviewBrowser";
import MainNavTab from "@/app/(protectedPage)/forms/[formId]/_components/mainNavTab";
import { FormContextProvider } from "@/components/formViewer/formContext";
import { api } from "@/trpc/react";
import { FormDesignEditor } from "./_components/formDesignEditor";
import { FormPublishToggle } from "./_components/formPublishToggle";
import NotFound from "./not-found";

type Props = {
  params: { formId: string };
};

function FormPageLoading() {
  return (
    <div className="h-full flex">
      <div className="px-3 max-h-[calc(100vh-100px)] w-[400px] min-w-[400px] overflow-auto">
        <MainNavTab.Skeleton />
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="p-0 pt-6" />
        </Card>
      </div>
      <div className="flex grow items-center justify-center py-3 " />
    </div>
  );
}

export default function FormPage({ params: { formId } }: Props) {
  const { organization, isLoaded } = useOrganization();
  const { isLoading, data, isError } = api.form.getOneWithFields.useQuery(
    {
      id: formId,
    },
    {
      throwOnError: false,
    },
  );

  if (isLoading || !isLoaded) {
    return <FormPageLoading />;
  }

  if (!data || isError || !organization) {
    return <NotFound />;
  }

  return (
    <FormContextProvider form={data}>
      <div className="h-full flex">
        {/* Form editor section */}
        <div className=" flex flex-col space-y-2 px-5 max-h-[calc(100vh-100px)] w-[450px] min-w-[450px] overflow-auto">
          <MainNavTab formId={formId} organizationId={organization.id} />

          <Card className="relative flex-grow overflow-auto border-0 bg-transparent shadow-none">
            {isLoading ? (
              <FormEditorFormSkeleton />
            ) : (
              <FormEditorCard form={data} organization={organization} />
            )}
          </Card>
          <div>
            <FormPublishToggle form={data} />
          </div>
        </div>
        {/* Form preview section */}
        <div className="flex grow items-center justify-center py-3 ">
          <div className="h-[100%] w-full pr-3">
            <FormPreviewBrowser formId={formId} />
          </div>
        </div>
        {/* Form customize section */}
        <div className="w-[400px] min-w-[400px] py-3">
          <FormDesignEditor organizationId={organization.id} formId={formId} />
        </div>
      </div>
    </FormContextProvider>
  );
}
