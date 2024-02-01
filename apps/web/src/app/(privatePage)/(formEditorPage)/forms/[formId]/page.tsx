"use client";

import { Button } from "@convoform/ui/components/ui/button";
import { Card, CardContent } from "@convoform/ui/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerPortal,
  DrawerTrigger,
} from "@convoform/ui/components/ui/drawer";
import { Eye } from "lucide-react";

import { montserrat } from "@/app/fonts";
import { NotFoundPage } from "@/components/common/notFound";
import {
  FormEditorCard,
  FormEditorFormSkeleton,
} from "@/components/formEditorPage/formEditor/formEditorCard";
import FormPreview from "@/components/formEditorPage/formPreview";
import NavLinks from "@/components/formEditorPage/navLinks";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/client";

type Props = {
  params: { formId: string };
};

export default function FormPage({ params: { formId } }: Props) {
  const { isLoading, data } = api.form.getOneWithFields.useQuery({
    id: formId,
  });

  if (isLoading) {
    return <FormPageLoading formId={formId} />;
  }

  if (!data) {
    return <NotFoundPage title="Form not found" />;
  }

  return (
    <div className="h-full lg:flex">
      <div className="px-3 lg:max-h-[calc(100vh-100px)] lg:w-[400px] lg:min-w-[400px] lg:overflow-auto">
        <NavLinks formId={formId} />
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="p-0 lg:pt-6">
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
        <NavLinks formId={formId} />
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
