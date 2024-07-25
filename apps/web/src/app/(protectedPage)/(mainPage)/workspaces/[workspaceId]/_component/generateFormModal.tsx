"use client";

import {
  aiGeneratedFormSchema,
  generateFormSchema,
} from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@convoform/ui/components/ui/form";
import { Textarea } from "@convoform/ui/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { ResponsiveModal } from "@/components/common/responsiveModal";
import Spinner from "@/components/common/spinner";
import { apiClient } from "@/lib/apiClient";
import type { HandleCreateForm } from "./createFormButton";

type Props = {
  onFormGenerated: HandleCreateForm;
  isCreatingForm: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
};

type State = {
  isGeneratingFormData: boolean;
  isGeneratedSuccessfully: boolean;
};

export function GenerateFormModal({
  onFormGenerated,
  isCreatingForm,
  open,
  setOpen,
}: Readonly<Props>) {
  const [state, setState] = useState<State>({
    isGeneratingFormData: false,
    isGeneratedSuccessfully: false,
  });
  const { isGeneratingFormData, isGeneratedSuccessfully } = state;
  const isBusy = isCreatingForm || isGeneratingFormData;
  const form = useForm<z.infer<typeof generateFormSchema>>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      formOverview: "",
    },
  });

  async function onSubmit(formData: z.infer<typeof generateFormSchema>) {
    const apiEndpoint = "ai/generateForm";
    setState((cs) => ({
      ...cs,
      isGeneratingFormData: true,
      isGeneratedSuccessfully: false,
    }));
    try {
      // Get AI generated form data to create new form
      const response = await apiClient(apiEndpoint, {
        method: "POST",
        data: formData,
      });
      const responseJson = await response.json();
      const newFormData = aiGeneratedFormSchema.parse(responseJson);
      setState((cs) => ({
        ...cs,
        isGeneratingFormData: false,
        isGeneratedSuccessfully: true,
      }));
      onFormGenerated({
        ...newFormData,
        formFields: newFormData.formFields,
        isAIGenerated: true,
        isPublished: true,
      });
    } catch (error: any) {
      let errorMessage =
        "This could be some server issue OR please check again provided form overview.";
      if (error instanceof Response) {
        const errorJson = await error.json();
        errorMessage = errorJson?.nonFieldError || errorMessage;
      }
      form.setError("formOverview", {
        type: "manual",
        message: errorMessage,
      });
      setState((cs) => ({
        ...cs,
        isGeneratingFormData: false,
        isGeneratedSuccessfully: false,
      }));
    }
  }

  return (
    <ResponsiveModal
      title="Generate Form using AI"
      open={open}
      setOpen={isGeneratingFormData ? undefined : setOpen}
    >
      {isGeneratingFormData && (
        <div className="flex justify-center">
          <Spinner label="Generating form" />
        </div>
      )}
      {isGeneratedSuccessfully && (
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="size-6 fill-green-100 stroke-green-500" />
          <span>Generated form successfully</span>
        </div>
      )}
      {!isBusy && !isGeneratedSuccessfully && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
            <FormField
              control={form.control}
              name="formOverview"
              render={({ field }) => (
                <FormItem>
                  <FormDescription>
                    Form fields will be auto-generated based on your brief
                    description
                  </FormDescription>
                  <FormMessage />
                  <FormControl>
                    <Textarea
                      {...field}
                      maxLength={500}
                      rows={10}
                      placeholder="Example: This is job application form for the role of full stack engineer. We required at least 2 years of work experience."
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isBusy}>
              <Sparkles className="mr-2 h-4 w-4" />
              <span>{isBusy ? "Generating..." : "Generate Form"}</span>
            </Button>
          </form>
        </Form>
      )}
    </ResponsiveModal>
  );
}
