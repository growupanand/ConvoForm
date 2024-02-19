"use client";

import { useState } from "react";
import { Button } from "@convoform/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@convoform/ui/components/ui/dialog";
import { Drawer, DrawerContent } from "@convoform/ui/components/ui/drawer";
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
import { Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useMediaQuery } from "@/hooks/use-media-query";
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
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function GenerateForm({
  onFormGenerated,
  isCreatingForm,
  open,
  setOpen,
}: Readonly<Props>) {
  const [isGeneratingFormData, setIsGeneratingFormData] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={!isGeneratingFormData ? setOpen : undefined}
      >
        <DialogContent>
          <DialogHeader className="mb-5">
            <DialogTitle>Generate Form using AI</DialogTitle>
          </DialogHeader>
          <GenerateFormContent
            isCreatingForm={isCreatingForm}
            onFormGenerated={onFormGenerated}
            setIsGeneratingFormData={setIsGeneratingFormData}
            isGeneratingFormData={isGeneratingFormData}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} snapPoints={[0.95]}>
      <DrawerContent className="h-full">
        <div className="mb-3">
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
        <div className="p-3">
          <GenerateFormContent
            isCreatingForm={isCreatingForm}
            onFormGenerated={onFormGenerated}
            setIsGeneratingFormData={setIsGeneratingFormData}
            isGeneratingFormData={isGeneratingFormData}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function GenerateFormContent({
  isCreatingForm,
  onFormGenerated,
  setIsGeneratingFormData,
  isGeneratingFormData,
}: Readonly<
  Omit<Props, "open" | "setOpen"> & {
    setIsGeneratingFormData: (isGeneratingFormData: boolean) => void;
    isGeneratingFormData: boolean;
  }
>) {
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
    setIsGeneratingFormData(true);
    try {
      // Get AI generated form data to create new form
      const response = await apiClient(apiEndpoint, {
        method: "POST",
        data: formData,
      });
      const responseJson = await response.json();
      const newFormData = createGeneratedFormSchema.parse(responseJson);
      await onFormGenerated({
        ...newFormData,
        formField: newFormData.formFields,
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
    } finally {
      setIsGeneratingFormData(false);
    }
  }
  return (
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
        <Button type="submit" disabled={isBusy}>
          <Sparkles className={cn("mr-2 h-4 w-4", isBusy && "animate-ping")} />
          <span>{isBusy ? "Generating..." : "Generate Form"}</span>
        </Button>
      </form>
    </Form>
  );
}
