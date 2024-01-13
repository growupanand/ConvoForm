"use client";

import { FormField } from "@prisma/client";
import { Eye } from "lucide-react";

import { montserrat } from "@/app/fonts";
import { useFormStore } from "@/lib/store/formStore";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerPortal,
  DrawerTrigger,
} from "../ui/drawer";
import { Skeleton } from "../ui/skeleton";
import FormEditorForm, { FormSubmitDataSchema } from "./formEditorForm";
import FormPreview from "./formPreview";
import NavLinks from "./navLinks";

export default function FormEditPage() {
  const formStore = useFormStore();
  const { form, isLoading } = formStore;

  const onUpdateForm = (
    updatedForm: Omit<FormSubmitDataSchema, "formField"> & {
      formField: FormField[];
    },
  ) => {
    formStore.updateForm(updatedForm);
  };

  if (isLoading || !form) {
    return <LoadingUI />;
  }

  return (
    <div className="h-full lg:flex">
      <div className="px-3 lg:max-h-[calc(100vh-100px)] lg:w-[400px] lg:min-w-[400px] lg:overflow-auto">
        <NavLinks />
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="p-0 lg:pt-6">
            <FormEditorForm form={form} onUpdated={onUpdateForm} />

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
                      <FormPreview form={form} />
                    </div>
                  </DrawerContent>
                </DrawerPortal>
              </Drawer>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex grow items-center justify-center py-3 max-lg:hidden">
        <div className="h-[100%] w-[90%]">
          <FormPreview form={form} />
        </div>
      </div>
    </div>
  );
}

const LoadingUI = () => {
  return (
    <div className="flex h-[calc(100vh-100px)] gap-5 px-5 pt-5">
      <div className=" z-40 w-[400px] min-w-[300px] overflow-y-scroll rounded-lg">
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent>
            <div className="grid gap-2">
              <Skeleton className="h-5 w-[64px]" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-5 w-[64px]" />

              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-5 w-[64px]" />

              <Skeleton className="h-10 w-full" />
              <br />
              <Skeleton className="h-[40px] w-full bg-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grow ">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
};
