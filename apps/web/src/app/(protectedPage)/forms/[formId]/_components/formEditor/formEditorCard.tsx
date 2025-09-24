"use client";

import type { Organization } from "@clerk/nextjs/server";
import {
  type FormField as FormFieldSchema,
  type Form as FormSchema,
  getSafeFormFieldsOrders,
  updateFormSchema,
} from "@convoform/db/src/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  MutedText,
} from "@convoform/ui";
import { Badge } from "@convoform/ui";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form as UIForm,
} from "@convoform/ui";
import { Input } from "@convoform/ui";
import { Skeleton } from "@convoform/ui";
import { Textarea } from "@convoform/ui";
import { toast } from "@convoform/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod/v4";

import { useFormContext } from "@/components/formViewer/formContext";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { FORM_SECTIONS_ENUMS } from "@convoform/db/src/schema/formDesigns/constants";
import { Label } from "@convoform/ui";
import { CustomizeEndScreenCard } from "./customizeEndScreenCard";
import { CustomizeFormCard } from "./customizeFormCard";
import { FieldsEditorCard } from "./fieldsEditorCard";

export type HandleUpdateFieldsOrder = (newFieldsOrder: string[]) => void;

type Props = {
  form: FormSchema & {
    formFields: FormFieldSchema[];
  };
  organization: Pick<Organization, "name" | "imageUrl">;
};

type State = {
  fieldsOrders: string[];

  // FAQ: You may think that we can use form.formFields directly from the props, So why we have to use State?
  //
  // Answer: because when we delete an field, formFields is updated but fieldsOrders is not at same time,
  // So we get error "field not found" for the deleted fieldId in fieldOrders,
  // to avoid that, we use formFields as state and update both at same time in useEffect
  formFields: FormFieldSchema[];
};

export function FormEditorCard({ form, organization }: Readonly<Props>) {
  const [state, setState] = useState<State>({
    fieldsOrders: getSafeFormFieldsOrders(form, form.formFields),
    formFields: form.formFields,
  });
  const { fieldsOrders, formFields } = state;

  useEffect(() => {
    setState((cs) => ({
      ...cs,
      formFields: form.formFields,
      fieldsOrders: getSafeFormFieldsOrders(form, form.formFields),
    }));
  }, [form.formFields]);

  const { setCurrentSection, currentSection } = useFormContext();

  const queryClient = useQueryClient();
  const updateForm = api.form.updateForm.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["form"]],
      });
    },
  });

  const isSavingForm = updateForm.isPending;

  const formHook = useForm<z.infer<typeof updateFormSchema>>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: form,
  });

  const isErrorInLandingPageFields =
    formHook.formState.errors.welcomeScreenTitle ||
    formHook.formState.errors.welcomeScreenMessage ||
    formHook.formState.errors.welcomeScreenCTALabel;

  const handleUpdateFieldsOrder: HandleUpdateFieldsOrder = (newFieldsOrder) => {
    // First update instantly in the browser UI, so that dragged fields can be seen in new order
    setState((cs) => ({ ...cs, fieldsOrders: newFieldsOrder }));

    // Now update in database
    const updateFormPromise = updateForm.mutateAsync({
      ...form,
      formFieldsOrders: newFieldsOrder,
    });
    toast.promise(updateFormPromise, {
      loading: "Saving order...",
      success: "Saved successfully",
      error: "Failed to save fields order",
    });
  };

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
        <AccordionItem
          value={FORM_SECTIONS_ENUMS.landingScreen}
          className="border-b-muted"
        >
          <AccordionTrigger
            className={cn(
              " group font-medium hover:no-underline ",
              isErrorInLandingPageFields && "text-red-500",
            )}
          >
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-md font-medium bg-subtle group-data-[state=open]:bg-subtle-foreground group-data-[state=open]:text-white"
              >
                1
              </Badge>{" "}
              <span>Landing screen</span>
            </div>
          </AccordionTrigger>
          <UIForm {...formHook}>
            <form onSubmit={formHook.handleSubmit(onSubmit)}>
              <AccordionContent className="space-y-4 pe-1 ps-10 pt-1">
                <FormField
                  control={formHook.control}
                  name="welcomeScreenTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Page Heading"
                          disabled={isSavingForm}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formHook.control}
                  name="welcomeScreenMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Short message to display below heading"
                          disabled={isSavingForm}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formHook.control}
                  name="welcomeScreenCTALabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button text</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Button text (E.g. Fill form, Get started)"
                          disabled={isSavingForm}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </form>
          </UIForm>
        </AccordionItem>

        <AccordionItem
          value={FORM_SECTIONS_ENUMS.questionsScreen}
          className="border-b-muted"
        >
          <AccordionTrigger
            className={cn(
              "group font-medium  hover:no-underline",
              // isErrorInRequirementFields && "text-red-500",
            )}
          >
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-md font-medium g-subtle group-data-[state=open]:bg-subtle-foreground group-data-[state=open]:text-white"
              >
                2
              </Badge>{" "}
              <span>Questions screen</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pe-0 ps-10 pt-1 space-y-4">
            <div>
              <UIForm {...formHook}>
                <form onSubmit={formHook.handleSubmit(onSubmit)}>
                  <FormField
                    control={formHook.control}
                    name="overview"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Form Overview</FormLabel>
                        <FormDescription>
                          This will help AI while generating questions.
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Write a brief description of what this form is for"
                            disabled={isSavingForm}
                            rows={5}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </UIForm>
            </div>
            <div className="grid space-y-2">
              <Label className="block">Questions</Label>
              <MutedText>
                Use shift + up or down to jump between questions
              </MutedText>
              <FieldsEditorCard
                formFields={formFields}
                formFieldsOrders={fieldsOrders}
                formId={form.id}
                handleUpdateFieldsOrder={handleUpdateFieldsOrder}
                isSavingForm={isSavingForm}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
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
