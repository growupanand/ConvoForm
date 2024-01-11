"use client";

import { FormField } from "@prisma/client";
import { Eye } from "lucide-react";

import { useFormStore } from "@/lib/store/formStore";
import { Button } from "../ui/button";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { Skeleton } from "../ui/skeleton";
import FormEditorForm, { FormSubmitDataSchema } from "./formEditorForm";
import FormPreview from "./formPreview";

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
    <div className="h-full gap-5 px-3 lg:flex lg:px-5">
      <div className=" rounded-lg pt-5 lg:max-h-[calc(100vh-100px)] lg:w-[400px] lg:min-w-[400px] lg:overflow-auto ">
        <Card className="border-0 bg-transparent shadow-none ">
          <CardTitle className="mb-5 text-lg font-semibold tracking-tight">
            Form Editor
          </CardTitle>
          <CardContent className="px-3">
            <FormEditorForm form={form} onUpdated={onUpdateForm} />

            <div className="py-3 lg:hidden">
              <Drawer snapPoints={[0.9, 1]}>
                <DrawerTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Show Preview
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-full">
                  <div className="h-full pt-3">
                    <FormPreview form={form} />
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grow py-5 max-lg:hidden">
        <FormPreview form={form} />
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
