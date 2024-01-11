"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form as PrismaForm,
  FormField as PrismaFormField,
} from "@prisma/client";
import {
  ArrowDownSquare,
  ArrowUpSquare,
  Check,
  CornerDownLeft,
  Info,
  Loader2,
  Plus,
  Save,
  Sparkle,
  Sparkles,
  X,
} from "lucide-react";
import {
  FieldArrayWithId,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { z } from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Form as UIForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/fetch";
import { cn } from "@/lib/utils";
import { formUpdateSchema } from "@/lib/validations/form";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { sendErrorResponseToast, toast } from "../ui/use-toast";

type FormWithFields = PrismaForm & { formField: PrismaFormField[] };

const formSchema = formUpdateSchema;
export type FormSubmitDataSchema = z.infer<typeof formSchema>;

type Props = {
  form: FormWithFields & { formField: PrismaFormField[] };
  onUpdated?: (
    updatedForm: Omit<FormSubmitDataSchema, "formField"> & {
      formField: PrismaFormField[];
    },
  ) => void;
};

type State = {
  isFormBusy: boolean;
  isGeneratingAIField: boolean;
};

export default function FormEditorForm(props: Props) {
  const { form } = props;
  const [state, setState] = useState<State>({
    isFormBusy: false,
    isGeneratingAIField: false,
  });
  const { isFormBusy, isGeneratingAIField } = state;

  const formHook = useForm<FormSubmitDataSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: form,
  });

  const isErrorInRequirementFields = formHook.formState.errors.formField;
  const isErrorInLandingPageFields =
    formHook.formState.errors.overview ||
    formHook.formState.errors.welcomeScreenTitle ||
    formHook.formState.errors.welcomeScreenMessage ||
    formHook.formState.errors.welcomeScreenCTALabel;
  const isErrorInAboutCompany = formHook.formState.errors.aboutCompany;

  const { fields, append, remove } = useFieldArray({
    control: formHook.control,
    name: "formField",
  });

  const onSubmit: SubmitHandler<FormSubmitDataSchema> = async (
    formData: FormSubmitDataSchema,
  ) => {
    setState((cs) => ({ ...cs, isFormBusy: true }));
    try {
      const response = await apiClient(`form/${form.id}`, {
        method: "PUT",
        data: formData,
      });
      const updatedForm = (await response.json()) as FormWithFields;
      toast({
        action: (
          <div className="w-full">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500 p-1">
                <Check className="text-white " />
              </div>
              <span>Changes saved successfully</span>
            </div>
          </div>
        ),
        duration: 1500,
      });
      const updatedFormWithFields = {
        ...formData,
        formField: updatedForm.formField,
      };

      props.onUpdated?.(updatedFormWithFields);
    } catch (error) {
      toast({
        title: "Unable to save changes",
        duration: 1500,
      });
    } finally {
      setState((cs) => ({ ...cs, isFormBusy: false }));
    }
  };

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
      aboutCompany: formData.aboutCompany,
      formField: formData.formField,
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
      formHook.trigger(["overview", "aboutCompany", "formField"]);
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
        formHook.setFocus(`formField.${currentFieldIndex + 1}.fieldName`);
      }
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const currentFieldIndex = fields.findIndex(
        (item) => item.id === currentFieldItem.id,
      );
      if (currentFieldIndex !== 0) {
        formHook.setFocus(`formField.${currentFieldIndex - 1}.fieldName`);
      }
    }
  };

  return (
    <div className="border-0 bg-transparent">
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
                    "group font-bold text-muted-foreground hover:text-black hover:no-underline data-[state=open]:text-black",
                    isErrorInLandingPageFields && "text-red-500",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="text-md group-data-[state=open]:bg-gray-500 group-data-[state=open]:text-white"
                    >
                      1
                    </Badge>
                    <span>Overview</span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="lg:ps-10">
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
                    "group font-bold text-muted-foreground hover:text-black hover:no-underline data-[state=open]:text-black",
                    isErrorInLandingPageFields && "text-red-500",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="text-md group-data-[state=open]:bg-gray-500 group-data-[state=open]:text-white"
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
                <AccordionContent className="space-y-4 lg:ps-10">
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
                    "group font-bold text-muted-foreground  hover:text-black hover:no-underline data-[state=open]:text-black",
                    isErrorInRequirementFields && "text-red-500",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="text-md  group-data-[state=open]:bg-gray-500 group-data-[state=open]:text-white"
                    >
                      3
                    </Badge>{" "}
                    <span>What you want to ask?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="lg:ps-10">
                  <div className="grid gap-2">
                    <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                      Use Arrow keys <ArrowUpSquare className="h-4 w-4 " />{" "}
                      <ArrowDownSquare className="h-4 w-4 " />{" "}
                      <CornerDownLeft className="h-3 w-3 " /> to navigate
                      between fields
                    </div>

                    {fields.map((item, index) => (
                      <FormField
                        key={item.id}
                        control={formHook.control}
                        name={`formField.${index}.fieldName`}
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
                                  disabled={index === 0 && fields.length === 1}
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
                        variant="outline"
                        onClick={() => append({ fieldName: "" })}
                        type="button"
                        size="sm"
                        disabled={isGeneratingAIField || isFormBusy}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Field
                      </Button>
                      <Button
                        variant="secondary"
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
                        Generate
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="about-company" className="border-b-muted">
                <AccordionTrigger
                  className={cn(
                    "group font-bold text-muted-foreground  hover:text-black hover:no-underline data-[state=open]:text-black",
                    isErrorInAboutCompany && "text-red-500",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="text-md  group-data-[state=open]:bg-gray-500 group-data-[state=open]:text-white"
                    >
                      4
                    </Badge>{" "}
                    <span>About company</span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="lg:ps-10">
                  <FormField
                    control={formHook.control}
                    name="aboutCompany"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="About your company" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Button className="w-full" type="submit" disabled={isFormBusy}>
            {getFormSubmitIcon()}
            {form.isPublished ? "Save changes" : "Publish"}
          </Button>
        </form>
      </UIForm>
    </div>
  );
}
