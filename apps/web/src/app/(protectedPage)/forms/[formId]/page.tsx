"use client";

import { useOrganization } from "@clerk/nextjs";
import { Button } from "@convoform/ui/components/ui/button";
import { Card, CardContent } from "@convoform/ui/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerPortal,
  DrawerTrigger,
} from "@convoform/ui/components/ui/drawer";
import { Label } from "@convoform/ui/components/ui/label";
import { sonnerToast } from "@convoform/ui/components/ui/sonner";
import { Switch } from "@convoform/ui/components/ui/switch";
import {
  showErrorResponseToast,
  toast,
} from "@convoform/ui/components/ui/use-toast";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";

import {
  FormEditorCard,
  FormEditorFormSkeleton,
} from "@/app/(protectedPage)/forms/[formId]/_components/formEditor/formEditorCard";
import FormPreviewBrowser from "@/app/(protectedPage)/forms/[formId]/_components/formEditor/formPreviewBrowser";
import MainNavTab from "@/app/(protectedPage)/forms/[formId]/_components/mainNavTab";
import { montserrat } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { FormCustomizeSheet } from "./_components/formEditor/formCustomizeSheet";
import NotFound from "./not-found";

type Props = {
  params: { formId: string };
};

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

  const updateFormIsPublished = api.form.updateIsPublished.useMutation();

  const { isPending: isPendingUpdateFormIsPublished } = updateFormIsPublished;

  if (isLoading || !isLoaded) {
    return <FormPageLoading formId={formId} />;
  }

  if (!data || isError || !organization) {
    return <NotFound />;
  }

  async function toggleIsFormPublished(checked: boolean): Promise<void> {
    const updateFormPromise = updateFormIsPublished.mutateAsync({
      formId,
      isPublished: checked,
    });

    sonnerToast.promise(updateFormPromise, {
      loading: "Saving changes...",
      success: "Changes saved successfully",
      error: "Unable to save changes",
    });
  }

  return (
    <motion.div
      className="slide-left-list"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration: 0.5 },
        translate: "0 -1rem",
      }}
    >
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
                        <FormPreviewBrowser formId={formId} noToolbar />
                      </div>
                    </DrawerContent>
                  </DrawerPortal>
                </Drawer>
              </div>
            </CardContent>
          </Card>
          <div className="mt-6 flex items-center justify-between px-2 max-lg:mb-6">
            <FormCustomizeSheet form={data} organization={organization} />
            <div className=" flex items-start justify-start gap-3">
              <Label
                htmlFor="isFormPublished"
                className="text-md cursor-pointer font-normal"
              >
                Published
              </Label>
              <Switch
                defaultChecked={data.isPublished}
                onCheckedChange={toggleIsFormPublished}
                id="isFormPublished"
                disabled={isPendingUpdateFormIsPublished}
              />
            </div>
          </div>
        </div>
        <div className="flex grow items-center justify-center py-3 max-lg:hidden">
          <div className="h-[100%] w-full pr-3">
            <FormPreviewBrowser formId={formId} />
          </div>
        </div>
      </div>
    </motion.div>
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
