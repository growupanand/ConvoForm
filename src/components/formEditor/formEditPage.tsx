"use client";

import FormPreview from "./formPreview";
import FormEditorForm, { FormSubmitDataSchema } from "./formEditorForm";
import { Card, CardContent, CardTitle } from "../ui/card";
import { useFormStore } from "@/lib/store/formStore";
import { Skeleton } from "../ui/skeleton";
import { FormField } from "@prisma/client";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Eye } from "lucide-react";

export default function FormEditPage() {
  const formStore = useFormStore();
  const { form, isLoading } = formStore;

  const onUpdateForm = (
    updatedForm: Omit<FormSubmitDataSchema, "formField"> & {
      formField: FormField[];
    }
  ) => {
    formStore.updateForm(updatedForm);
  };

  if (isLoading || !form) {
    return <LoadingUI />;
  }

  return (
    <div className="lg:flex gap-5 h-full px-3 lg:px-5">
      <div className=" rounded-lg lg:min-w-[400px] lg:w-[400px] pt-5 lg:overflow-auto lg:max-h-[calc(100vh-100px)] ">
        <Card className="border-0 shadow-none bg-transparent ">
          <CardTitle className="text-lg font-semibold tracking-tight mb-5">
            Form Editor
          </CardTitle>
          <CardContent className="px-3">
            <FormEditorForm form={form} onUpdated={onUpdateForm} />

            <div className="lg:hidden py-3">
              <Drawer snapPoints={[0.9, 1]}>
                <DrawerTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Show Preview
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-full">
                  <div className="pt-3 h-full">
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
    <div className="flex gap-5 px-5 pt-5 h-[calc(100vh-100px)]">
      <div className=" z-40 rounded-lg overflow-y-scroll min-w-[300px] w-[400px]">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent>
            <div className="grid gap-2">
              <Skeleton className="w-[64px] h-5" />
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-[64px] h-5" />

              <Skeleton className="w-full h-10" />
              <Skeleton className="w-[64px] h-5" />

              <Skeleton className="w-full h-10" />
              <br />
              <Skeleton className="w-full h-[40px] bg-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grow ">
        <Skeleton className="w-full h-full" />
      </div>
    </div>
  );
};
