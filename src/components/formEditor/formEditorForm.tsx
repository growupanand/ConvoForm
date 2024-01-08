"use client";

import {
  Form as UIForm,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formUpdateSchema } from "@/lib/validations/form";
import { Button } from "../ui/button";
import { useState } from "react";
import { apiClient } from "@/lib/fetch";
import {
  Check,
  Info,
  Loader2,
  Plus,
  Save,
  Sparkle,
  X,
} from "lucide-react";
import { toast } from "../ui/use-toast";
import {
  FormField as PrismaFormField,
  Form as PrismaForm,
} from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "../ui/badge";

type FormWithFields = PrismaForm & { formField: PrismaFormField[] };

const formSchema = formUpdateSchema;
export type FormSubmitDataSchema = z.infer<typeof formSchema>;

type Props = {
  form: FormWithFields & { formField: PrismaFormField[] };
  onUpdated?: (
    updatedForm: Omit<FormSubmitDataSchema, "formField"> & {
      formField: PrismaFormField[];
    }
  ) => void;
};

type State = {
  isFormBusy: boolean;
};

export default function FormEditorForm(props: Props) {
  const { form } = props;
  const [state, setState] = useState<State>({
    isFormBusy: false,
  });
  const { isFormBusy } = state;

  const formHook = useForm<FormSubmitDataSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: form,
  });

  const isErrorInRequirementFields = formHook.formState.errors.formField;
  const isErrorInLandingPageFields = formHook.formState.errors.overview || formHook.formState.errors.welcomeScreenTitle || formHook.formState.errors.welcomeScreenMessage || formHook.formState.errors.welcomeScreenCTALabel;
  const isErrorInAboutCompany = formHook.formState.errors.aboutCompany;

  const { fields, append, remove } = useFieldArray({
    control: formHook.control,
    name: "formField",
  });

  const onSubmit: SubmitHandler<FormSubmitDataSchema> = async (
    formData: FormSubmitDataSchema
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
              <div className="bg-green-500 rounded-full p-1">
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

  return (
    <div className="bg-transparent border-0">
      <UIForm {...formHook}>
        <form onSubmit={formHook.handleSubmit(onSubmit)}>
          <div className="space-y-4 mb-8">
            <Accordion type="single" collapsible className="w-full" defaultValue="overview">
              <AccordionItem value="overview" className="border-b-muted">
                <AccordionTrigger className={cn(
                  "hover:no-underline text-muted-foreground hover:text-black data-[state=open]:text-black font-bold group",
                  isErrorInLandingPageFields && "text-red-500"
                )}>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-md group-data-[state=open]:bg-gray-500 group-data-[state=open]:text-white">
                      1
                    </Badge><span>Overview</span></div>
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


              <AccordionItem value="landing-page-fields" className="border-b-muted">
                <AccordionTrigger className={cn(
                  "hover:no-underline text-muted-foreground hover:text-black data-[state=open]:text-black font-bold group",
                  isErrorInLandingPageFields && "text-red-500"
                )}>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-md group-data-[state=open]:bg-gray-500 group-data-[state=open]:text-white">
                      2
                    </Badge> <span>Landing page</span>
                  </div>

                </AccordionTrigger>
                <AccordionContent className="space-y-4 lg:ps-10">
                  <p className="text-muted-foreground flex items-center gap-2"><Info size="15px" /> This will show on first page</p>

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

              <AccordionItem value="requirement-fields" className="border-b-muted">
                <AccordionTrigger className={cn(
                  "hover:no-underline text-muted-foreground hover:text-black  data-[state=open]:text-black font-bold group",
                  isErrorInRequirementFields && "text-red-500"
                )}>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-md  group-data-[state=open]:bg-gray-500 group-data-[state=open]:text-white">
                      3
                    </Badge> <span>What you want to ask?</span>
                  </div>

                </AccordionTrigger>
                <AccordionContent className="lg:ps-10">
                  <div className="grid gap-2">

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
                                  {...field}
                                />
                                <Button
                                  variant="ghost"
                                  disabled={index === 0 && fields.length === 1}
                                  onClick={() => fields.length != 1 && remove(index)}
                                  type="button"
                                  size="icon"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}

                    <div className="mt-2">
                      <Button
                        variant="secondary"
                        onClick={() => append({ fieldName: "" })}
                        type="button"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Field
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="about-company" className="border-b-muted">
                <AccordionTrigger className={
                  cn("hover:no-underline text-muted-foreground hover:text-black  data-[state=open]:text-black font-bold group",
                    isErrorInAboutCompany && "text-red-500")
                }>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-md  group-data-[state=open]:bg-gray-500 group-data-[state=open]:text-white">
                      4
                    </Badge> <span>About company</span>
                  </div>

                </AccordionTrigger>

                <AccordionContent className="lg:ps-10">
                  <FormField
                    control={formHook.control}
                    name="aboutCompany"
                    render={({ field }) => (

                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="About your company"
                            {...field}
                          />
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
