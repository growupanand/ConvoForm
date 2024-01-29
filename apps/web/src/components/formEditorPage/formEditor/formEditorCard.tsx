"use client";

import { useEffect, useState } from "react";
import { api } from "@convoform/api/trpc/react";
import {
  Form as PrismaForm,
  FormField as PrismaFormField,
} from "@convoform/db";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@convoform/ui/components/ui/accordion";
import { Badge } from "@convoform/ui/components/ui/badge";
import { Button } from "@convoform/ui/components/ui/button";
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
import {
  sendErrorResponseToast,
  toast,
} from "@convoform/ui/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDownSquare,
  ArrowUpSquare,
  CornerDownLeft,
  Info,
  Loader2,
  Plus,
  Save,
  Sparkle,
  Sparkles,
  X,
} from "lucide-react";
import { FieldArrayWithId, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { montserrat } from "@/app/fonts";
import { apiClient } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { formUpdateSchema } from "@/lib/validations/form";

const formSchema = formUpdateSchema;
export type FormSubmitDataSchema = z.infer<typeof formSchema>;

type Props = {
  form: PrismaForm & { formFields: PrismaFormField[] };
};

type State = {
  isGeneratingAIField: boolean;
};

export function FormEditorCard({ form }: Readonly<Props>) {
  const [state, setState] = useState<State>({
    isGeneratingAIField: false,
  });
  const { isGeneratingAIField } = state;

  const formDefaultValues = form as FormSubmitDataSchema;

  const formHook = useForm<FormSubmitDataSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: formDefaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: formHook.control,
    name: "formFields",
  });

  // This will reset form when another form page is opened, otherwise react-hook-form will keep previous form values
  useEffect(() => {
    formHook.reset(formDefaultValues);
  }, [form]);

  const isErrorInRequirementFields = formHook.formState.errors.formFields;
  const isErrorInLandingPageFields =
    formHook.formState.errors.overview ||
    formHook.formState.errors.welcomeScreenTitle ||
    formHook.formState.errors.welcomeScreenMessage ||
    formHook.formState.errors.welcomeScreenCTALabel;

  const updateForm = api.form.updateForm.useMutation({
    onSuccess: () => {
      toast({
        title: "Changes saved successfully",
        duration: 1500,
      });
    },
  });
  const isFormBusy = updateForm.isLoading;

  const onSubmit = (formData: FormSubmitDataSchema) =>
    updateForm.mutateAsync({
      id: form.id,
      ...formData,
    });

  const getFormSubmitIcon = () => {
    if (isFormBusy) {
      return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    }
    if (form.isPublished) {
      return <Save className="mr-2 h-4 w-4" />;
    }
    return <Sparkle className="mr-2 h-4 w-4" />;
  };

  const generateAIField = async () => {
    const apiEndpoint = `/form/${form.id}/getNextFormField/`;
    const formData = formHook.getValues();
    const payload = {
      overview: formData.overview,
      formField: formData.formFields,
    };
    setState((cs) => ({ ...cs, isGeneratingAIField: true }));
    formHook.clearErrors();
    try {
      const response = await apiClient(apiEndpoint, {
        method: "POST",
        data: payload,
      });
      const responseJson = await response.json();
      const { fieldName } = responseJson;
      append({ fieldName });
    } catch (error: any) {
      formHook.trigger(["overview", "formFields"]);
      sendErrorResponseToast(error, "Unable to generate field");
    } finally {
      setState((cs) => ({ ...cs, isGeneratingAIField: false }));
    }
  };

  const handleFormFieldInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    currentFieldItem: FieldArrayWithId,
  ) => {
    // we want to move input focus to next input on press enter
    if (event.key === "Enter" || event.key === "ArrowDown") {
      event.preventDefault();
      const lastFieldIndex = fields.length - 1;
      const currentFieldIndex = fields.findIndex(
        (item) => item.id === currentFieldItem.id,
      );
      if (currentFieldIndex !== lastFieldIndex) {
        formHook.setFocus(`formFields.${currentFieldIndex + 1}.fieldName`);
      }
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const currentFieldIndex = fields.findIndex(
        (item) => item.id === currentFieldItem.id,
      );
      if (currentFieldIndex !== 0) {
        formHook.setFocus(`formFields.${currentFieldIndex - 1}.fieldName`);
      }
    }
  };

  return (
    <div className="border-0 bg-transparent px-2">
      <UIForm {...formHook}>
        <form onSubmit={formHook.handleSubmit(onSubmit)}>
          <div className="mb-8 space-y-4">
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue="overview"
            >
              <AccordionItem value="overview" className="border-b-muted">
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

              <AccordionItem
                value="requirement-fields"
                className="border-b-muted"
              >
                <AccordionTrigger
                  className={cn(
                    "text-muted-foreground group font-medium  hover:text-black hover:no-underline data-[state=open]:text-black",
                    isErrorInRequirementFields && "text-red-500",
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
                  <div className="grid gap-2">
                    <div className="text-muted-foreground mb-2 flex items-center gap-1 text-xs">
                      Use Arrow keys <ArrowUpSquare className="h-4 w-4 " />{" "}
                      <ArrowDownSquare className="h-4 w-4 " />{" "}
                      <CornerDownLeft className="h-3 w-3 " /> to navigate
                      between fields
                    </div>

                    {fields.map((item, index) => (
                      <FormField
                        key={item.id}
                        control={formHook.control}
                        name={`formFields.${index}.fieldName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex w-full max-w-sm items-center space-x-2">
                                <Input
                                  placeholder={`E.g. name, email or anything`}
                                  onKeyDown={(e) =>
                                    handleFormFieldInputKeyDown(e, item)
                                  }
                                  {...field}
                                />
                                <Button
                                  variant="ghost"
                                  disabled={
                                    (index === 0 && fields.length === 1) ||
                                    isGeneratingAIField ||
                                    isFormBusy
                                  }
                                  onClick={() =>
                                    fields.length != 1 && remove(index)
                                  }
                                  type="button"
                                  size="icon"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}

                    <div className="mt-2 flex items-center justify-start gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => append({ fieldName: "" })}
                        type="button"
                        size="sm"
                        disabled={isGeneratingAIField || isFormBusy}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Field
                      </Button>
                      <Button
                        variant="outline"
                        onClick={generateAIField}
                        type="button"
                        size="sm"
                        disabled={isGeneratingAIField || isFormBusy}
                      >
                        <Sparkles
                          className={cn(
                            "mr-2 h-4 w-4",
                            isGeneratingAIField && "animate-ping",
                          )}
                        />
                        Auto Generate
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Button
            className={cn(
              "w-full transition-all hover:scale-105 active:scale-100",
              montserrat.className,
            )}
            type="submit"
            disabled={isFormBusy || isGeneratingAIField}
          >
            {getFormSubmitIcon()}
            {form.isPublished ? "Publish changes" : "Publish form"}
          </Button>
        </form>
      </UIForm>
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
