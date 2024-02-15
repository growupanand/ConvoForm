"use client";

import { useState } from "react";
import { Button } from "@convoform/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@convoform/ui/components/ui/dialog";
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
import { Loader2, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { montserrat } from "@/app/fonts";
import { apiClient } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import {
  createFormSchema,
  createGeneratedFormSchema,
  generateFormSchema,
} from "@/lib/validations/form";

type Props = {
  onFormGenerated: (
    formData: z.infer<typeof createFormSchema>,
  ) => Promise<void>;
  isCreatingForm: boolean;
};

type State = {
  isGeneratingFormData: boolean;
};

export function GenerateForm({
  onFormGenerated,
  isCreatingForm,
}: Readonly<Props>) {
  const [state, setState] = useState<State>({
    isGeneratingFormData: false,
  });
  const { isGeneratingFormData } = state;

  const isBusy = isCreatingForm || isGeneratingFormData;

  const form = useForm<z.infer<typeof generateFormSchema>>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      formOverview: "",
    },
  });

  async function onSubmit(formData: z.infer<typeof generateFormSchema>) {
    const apiEndpoint = `ai/generateForm`;
    console.log({ formData });
    setState((cs) => ({
      ...cs,
      isGeneratingFormData: true,
    }));
    try {
      // Get AI generated form data to create new form
      const response = await apiClient(apiEndpoint, {
        method: "POST",
        data: formData,
      });
      const responseJson = await response.json();
      const newFormData = createGeneratedFormSchema.parse(responseJson);
      console.log("form generated successfully", { newFormData });
      await onFormGenerated({
        ...newFormData,
        formField: newFormData.formFields,
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
        isErrorGeneratingFormData: true,
      }));
    } finally {
      setState((cs) => ({ ...cs, isGeneratingFormData: false }));
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={isBusy}
          className={cn(montserrat.className, "font-semibold")}
        >
          {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!isBusy && (
            <Sparkles
              className={cn(
                "mr-2 h-4 w-4",
                isGeneratingFormData && "animate-ping",
              )}
            />
          )}
          Generate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="mb-5">
          <DialogTitle>Generate form using AI</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
            <FormField
              control={form.control}
              name="formOverview"
              render={({ field }) => (
                <FormItem>
                  <FormMessage />

                  <FormControl>
                    <Textarea
                      {...field}
                      maxLength={500}
                      rows={10}
                      placeholder="Example: This is job application form for the role of full stack engineer. We required at least 2 years of work experience."
                    />
                  </FormControl>
                  <FormDescription>
                    Briefly explain about your form overview
                  </FormDescription>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isGeneratingFormData}>
              <Sparkles
                className={cn(
                  "mr-2 h-4 w-4",
                  isGeneratingFormData && "animate-ping",
                )}
              />
              <span>Generate Form</span>
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
