"use client";

import type { Organization } from "@clerk/clerk-sdk-node";
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
} from "@convoform/ui/components/ui/accordion";
import { Badge } from "@convoform/ui/components/ui/badge";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
  Form as UIForm,
} from "@convoform/ui/components/ui/form";
import { Input } from "@convoform/ui/components/ui/input";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import { sonnerToast } from "@convoform/ui/components/ui/sonner";
import { Textarea } from "@convoform/ui/components/ui/textarea";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { isRateLimitErrorResponse } from "@/lib/errorHandlers";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { FieldsEditorCard } from "./fieldsEditorCard";
import { FormCustomizeCard } from "./formCustomizeCard";

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

  const queryClient = useQueryClient();
  const updateForm = api.form.updateForm.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["form"]],
      });
    },
    onError: (error) => {
      if (isRateLimitErrorResponse(error)) {
        toast({
          title: "Rate limit exceeded",
          duration: 1500,
          variant: "destructive",
          description: error.message,
        });
      }
    },
  });

  const isSavingForm = updateForm.isPending;

  const formHook = useForm<z.infer<typeof updateFormSchema>>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: form,
  });

  const isErrorInOverviewFields = formHook.formState.errors.overview;
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
    sonnerToast.promise(updateFormPromise, {
      loading: "Saving order...",
      success: "Saved successfully",
      error: "Failed to save fields order",
    });
  };

  const onSubmit = (formData: z.infer<typeof updateFormSchema>) => {
    const updateFormPromise = updateForm.mutateAsync({
      ...formData,
    });

    sonnerToast.promise(updateFormPromise, {
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
        defaultValue="overview"
      >
        <UIForm {...formHook}>
          <form onSubmit={formHook.handleSubmit(onSubmit)}>
            <AccordionItem value="overview" className="border-b-muted">
              <AccordionTrigger
                className={cn(
                  "text-muted-foreground group font-medium hover:text-black hover:no-underline data-[state=open]:text-black",
                  isErrorInOverviewFields && "text-red-500",
                )}
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="text-md font-medium group-data-[state=open]:bg-gray-500 group-data-[state=open]:text-white"
                  >
                    1
                  </Badge>
                  <span>Overview</span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pe-1 ps-10 pt-1">
                <FormField
                  control={formHook.control}
                  name="overview"
                  render={({ field }) => (
                    <FormItem>
                      <FormDescription>
                        This text will be utilized by the AI to generate
                        questions.
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="landing-page-fields"
              className="border-b-muted"
            >
              <AccordionTrigger
                className={cn(
                  "text-muted-foreground group font-medium hover:text-black hover:no-underline data-[state=open]:text-black",
                  isErrorInLandingPageFields && "text-red-500",
                )}
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="text-md font-medium group-data-[state=open]:bg-gray-500 group-data-[state=open]:text-white"
                  >
                    2
                  </Badge>{" "}
                  <span>Landing page</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pe-1 ps-10 pt-1">
                <FormField
                  control={formHook.control}
                  name="welcomeScreenTitle"
                  render={({ field }) => (
                    <FormItem>
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
            </AccordionItem>
          </form>
        </UIForm>
        <AccordionItem value="requirement-fields" className="border-b-muted">
          <AccordionTrigger
            className={cn(
              "text-muted-foreground group font-medium  hover:text-black hover:no-underline data-[state=open]:text-black",
              // isErrorInRequirementFields && "text-red-500",
            )}
          >
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-md font-medium group-data-[state=open]:bg-gray-500 group-data-[state=open]:text-white"
              >
                3
              </Badge>{" "}
              <span>What you want to ask ?</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pe-1 ps-10 pt-1">
            <FieldsEditorCard
              formFields={formFields}
              formFieldsOrders={fieldsOrders}
              formId={form.id}
              handleUpdateFieldsOrder={handleUpdateFieldsOrder}
              isSavingForm={isSavingForm}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="ending-page" className="border-none">
          <AccordionTrigger
            className={cn(
              "text-muted-foreground group font-medium  hover:text-black hover:no-underline data-[state=open]:text-black",
            )}
          >
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-md font-medium group-data-[state=open]:bg-gray-500 group-data-[state=open]:text-white"
              >
                4
              </Badge>
              <span>Ending page</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pe-1 ps-10 pt-1">
            <FormCustomizeCard form={form} organization={organization} />
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
      <Skeleton className="h-5 w-[64px]" />

      <Skeleton className="h-10 w-full" />
      <br />
      <Skeleton className="h-[40px] w-full" />
    </div>
  );
};
