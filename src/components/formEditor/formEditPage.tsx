"use client";

import FormPreview from "./formPreview";
import FormEditor, { FormSubmitDataSchema } from "../formEditor";
import { Card, CardContent } from "../ui/card";
import { useFormStore } from "@/lib/store/formStore";
import { Skeleton } from "../ui/skeleton";
import { FormField } from "@prisma/client";

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
    <div className="flex gap-5 px-5 h-full">
      <div className=" rounded-lg overflow-y-scroll min-w-[400px] w-[400px] h-[calc(100vh-100px)] pt-5 ">
        <Card className="border-0 shadow-none bg-transparent ">
          <CardContent>
            <h3 className=" text-lg font-semibold tracking-tight mb-5">
              Form Editor
            </h3>
            <FormEditor form={form} onUpdated={onUpdateForm} />
          </CardContent>
        </Card>
      </div>
      <div className="grow pt-5 ">
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
