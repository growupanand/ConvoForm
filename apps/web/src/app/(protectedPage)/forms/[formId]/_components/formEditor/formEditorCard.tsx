"use client";

import { useEffect } from "react";
import {
  FormField as FormFieldSchema,
  Form as FormSchema,
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
  FormField,
  FormItem,
  FormMessage,
  Form as UIForm,
} from "@convoform/ui/components/ui/form";
import { Input } from "@convoform/ui/components/ui/input";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@convoform/ui/components/ui/tooltip";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Spinner from "@/components/common/spinner";
import { isRateLimitErrorResponse } from "@/lib/errorHandlers";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { FieldsEditorCard } from "./fieldsEditorCard";

type Props = {
  form: FormSchema & { formFields: FormFieldSchema[] };
};

export function FormEditorCard({ form }: Readonly<Props>) {
  const queryClient = useQueryClient();
  const updateForm = api.form.updateForm.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["form"]],
      });
      toast({
        title: "Changes saved successfully",
        duration: 1500,
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to save changes",
        duration: 1500,
        variant: "destructive",
        description: isRateLimitErrorResponse(error)
          ? error.message
          : undefined,
      });
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

  const onSubmit = (formData: z.infer<typeof updateFormSchema>) => {
    updateForm.mutate({
      ...formData,
    });
  };

  // Autosave functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formHook.formState.isDirty) {
        formHook.handleSubmit(onSubmit)();
      }
    }, 2000); // Delay of 2 seconds

    return () => clearTimeout(timeoutId); // Cleanup timeout on component unmount or value change
  }, [formHook.watch()]); // Watch all form changes

  // Reset form in react-hook-form when props change
  useEffect(() => {
    formHook.reset(form);
  }, [form]);

  return (
    <div className="center flex h-full flex-col justify-between border-0 px-2">
      <div className="mb-8 space-y-4">
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

                <AccordionContent className="lg:pe-1 lg:ps-10 lg:pt-1">
                  <FormField
                    control={formHook.control}
                    name="overview"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Purpose of this form"
                            {...field}
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
                    <span>Landing page </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 " />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="start">
                          This will show on first page
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 lg:pe-1 lg:ps-10 lg:pt-1">
                  <FormField
                    control={formHook.control}
                    name="welcomeScreenTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Page Heading" {...field} />
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
                            placeholder="Short message to display below heading"
                            {...field}
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
                            placeholder="Button text (E.g. Fill form, Get started)"
                            {...field}
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
                <span>What you want to ask?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="lg:pe-1 lg:ps-10 lg:pt-1">
              <FieldsEditorCard formFields={form.formFields} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="relative overflow-hidden py-3">
        {isSavingForm && <Spinner label="Saving form" />}
      </div>
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
