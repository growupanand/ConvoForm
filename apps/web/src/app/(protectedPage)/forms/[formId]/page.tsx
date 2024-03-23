"use client";

import { notFound } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import { Button } from "@convoform/ui/components/ui/button";
import { Card, CardContent } from "@convoform/ui/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerPortal,
  DrawerTrigger,
} from "@convoform/ui/components/ui/drawer";
import { Eye } from "lucide-react";

import {
  FormEditorCard,
  FormEditorFormSkeleton,
} from "@/app/(protectedPage)/forms/[formId]/_components/formEditor/formEditorCard";
import FormPreview from "@/app/(protectedPage)/forms/[formId]/_components/formEditor/formPreview";
import MainNavTab from "@/app/(protectedPage)/forms/[formId]/_components/mainNavTab";
import { montserrat } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { FormCustomize } from "./_components/formEditor/formCustomize";

type Props = {
  params: { formId: string };
};

export default function FormPage({ params: { formId } }: Props) {
  const { organization, isLoaded } = useOrganization();
  const { isLoading, data } = api.form.getOneWithFields.useQuery({
    id: formId,
  });

  if (isLoading || !isLoaded) {
    return <FormPageLoading formId={formId} />;
  }

  if (!data || !organization || data.organizationId !== organization.id) {
    return notFound();
  }

  return (
    <div className="h-full lg:flex">
      <div className="flex flex-col px-3 lg:max-h-[calc(100vh-100px)] lg:w-[400px] lg:min-w-[400px] lg:overflow-auto">
        <MainNavTab formId={formId} />
        <Card className="relative flex-grow overflow-auto border-0 bg-transparent shadow-none">
          <CardContent className="p-0">
            {isLoading ? (
              <FormEditorFormSkeleton />
            ) : (
              <FormEditorCard form={data} />
            )}

            <div className="py-3 lg:hidden">
              <Drawer snapPoints={[0.95]}>
                <DrawerTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full", montserrat.className)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Show Preview
                  </Button>
                </DrawerTrigger>
                <DrawerPortal>
                  <DrawerContent className="h-full">
                    <div className="h-full pt-3">
                      <FormPreview formId={formId} noToolbar />
                    </div>
                  </DrawerContent>
                </DrawerPortal>
              </Drawer>
            </div>
          </CardContent>
        </Card>
        <div className="mt-5 max-lg:mb-3 lg:mt-10">
          <FormCustomize form={data} organization={organization} />
        </div>
      </div>
      <div className="flex grow items-center justify-center py-3 max-lg:hidden">
        <div className="h-[100%] w-full pr-3">
          <FormPreview formId={formId} />
        </div>
      </div>
    </div>
  );
}

function FormPageLoading({ formId }: { formId: string }) {
  return (
    <div className="h-full lg:flex">
      <div className="px-3 lg:max-h-[calc(100vh-100px)] lg:w-[400px] lg:min-w-[400px] lg:overflow-auto">
        <MainNavTab formId={formId} />
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="p-0 lg:pt-6">
            <FormEditorFormSkeleton />

            <div className="py-3 lg:hidden">
              <Button
                variant="outline"
                className={cn("w-full", montserrat.className)}
                disabled
              >
                <Eye className="mr-2 h-4 w-4" />
                Show Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex grow items-center justify-center py-3 max-lg:hidden"></div>
    </div>
  );
}
