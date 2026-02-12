"use client";

import type { Organization } from "@clerk/nextjs/server";
import {
  type FormField as FormFieldSchema,
  type Form as FormSchema,
  updateFormSchema,
} from "@convoform/db/src/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@convoform/ui";
import { Badge } from "@convoform/ui";
import { Skeleton } from "@convoform/ui";
import { toast } from "@convoform/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod/v4";

import { useFormContext } from "@/components/formViewer/formContext";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { FORM_SECTIONS_ENUMS } from "@convoform/db/src/schema/formDesigns/constants";
import { CustomizeEndScreenCard } from "./customizeEndScreenCard";
import { CustomizeFormCard } from "./customizeFormCard";
import { FormInfoSection } from "./formInfoSection";
import { useFormFieldsState } from "./useFormFieldsState";
import { WelcomeScreenSection } from "./welcomeScreenSection";

type Props = {
  form: FormSchema & {
    formFields: FormFieldSchema[];
  };
  organization: Pick<Organization, "name" | "imageUrl">;
};

export function FormEditorCard({ form, organization }: Readonly<Props>) {
  const queryClient = useQueryClient();
  const updateForm = api.form.updateForm.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["form"]],
      });
    },
  });

  const { fieldsOrders, formFields, handleUpdateFieldsOrder } =
    useFormFieldsState(form, updateForm);

  const { setCurrentSection, currentSection } = useFormContext();

  const isSavingForm = updateForm.isPending;

  const formHook = useForm<z.infer<typeof updateFormSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(updateFormSchema) as any,
    defaultValues: form as unknown as z.infer<typeof updateFormSchema>,
  });

  const isErrorInLandingPageFields =
    formHook.formState.errors.welcomeScreenTitle ||
    formHook.formState.errors.welcomeScreenMessage ||
    formHook.formState.errors.welcomeScreenCTALabel;

  const onSubmit = (formData: z.infer<typeof updateFormSchema>) => {
    const updateFormPromise = updateForm.mutateAsync({
      ...formData,
    });

    toast.promise(updateFormPromise, {
      loading: "Saving changes...",
      success: "Changes saved successfully",
      error: "Failed to save changes",
    });
  };

  // Autosave functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formHook.formState.isDirty) {
        formHook.handleSubmit(onSubmit)();
      }
    }, 1000);

    return () => clearTimeout(timeoutId); // Cleanup timeout on component unmount or value change
  }, [formHook.watch()]); // Watch all form changes

  // Reset form in react-hook-form when props change
  useEffect(() => {
    formHook.reset(form);
  }, [form]);

  return (
    <div
      // To avoid showing vertical scrollbar when opening a accordion item
      className="overflow-x-hidden"
    >
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={currentSection}
        onValueChange={setCurrentSection}
      >
        <WelcomeScreenSection
          formHook={formHook}
          onSubmit={onSubmit}
          isErrorInLandingPageFields={!!isErrorInLandingPageFields}
          isSavingForm={isSavingForm}
        />

        <FormInfoSection
          formHook={formHook}
          onSubmit={onSubmit}
          formFields={formFields}
          fieldsOrders={fieldsOrders}
          formId={form.id}
          handleUpdateFieldsOrder={handleUpdateFieldsOrder}
          isSavingForm={isSavingForm}
        />

        <AccordionItem
          value={FORM_SECTIONS_ENUMS.endingScreen}
          className="border-none"
        >
          <AccordionTrigger
            className={cn("group font-medium  hover:no-underline ")}
          >
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-md font-medium g-subtle group-data-[state=open]:bg-subtle-foreground group-data-[state=open]:text-white "
              >
                3
              </Badge>
              <span>Ending screen</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pe-1 ps-10 pt-1">
            <CustomizeEndScreenCard form={form} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value={FORM_SECTIONS_ENUMS.defaultScreen}
          className="border-none"
        >
          <AccordionTrigger
            className={cn("group font-medium  hover:no-underline")}
          >
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-md font-medium g-subtle group-data-[state=open]:bg-subtle-foreground group-data-[state=open]:text-white"
              >
                4
              </Badge>
              <span>Default screen</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pe-1 ps-10 pt-1">
            <CustomizeFormCard form={form} organization={organization} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export const FormEditorFormSkeleton = () => {
  return (
    <div className="grid gap-2">
      <Skeleton className="h-5 w-[64px]" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-5 w-[64px]" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
};
