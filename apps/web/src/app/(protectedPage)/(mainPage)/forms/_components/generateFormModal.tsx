"use client";

import {
  aiGeneratedFormSchema,
  generateFormSchema,
} from "@convoform/db/src/schema";
import { Button } from "@convoform/ui";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@convoform/ui";
import { Textarea } from "@convoform/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CheckCircle2, Pen, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import Spinner from "@/components/common/spinner";
import { useAutoHeightHook } from "@/hooks/auto-height-hook";
import { apiClient } from "@/lib/apiClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@convoform/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@convoform/ui";
import type { HandleCreateForm } from "./createFormButton";

type Props = {
  onFormGenerated: HandleCreateForm;
  isCreatingForm: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
};

type State = {
  isGeneratingForm: boolean;
  isGeneratingFormData: boolean;
  isSavingForm: boolean;
  isGeneratedForm: boolean;
};

const initialState = {
  isGeneratingFormData: false,
  isGeneratingForm: false,
  isSavingForm: false,
  isGeneratedForm: false,
} as State;

const formGenerationTemplates = [
  {
    name: "Job application form",
    description:
      "This is job application form for the role of full stack engineer. We required at least 2 years of work experience.",
  },
  {
    name: "Contact form",
    description:
      "This is an contact form, where customer can contact us. He can provide his name, email, mobile number and message.",
  },
  {
    name: "Feedback form",
    description:
      "This is a feedback form, where customer can submit feedback for my product. I would like to know his name, contact detail and feedback.",
  },
];

const apiEndpoint = "ai/generateForm";

export function GenerateFormModal({
  onFormGenerated,
  isCreatingForm,
  open,
  setOpen,
}: Readonly<Props>) {
  const [state, setState] = useState<State>(initialState);
  const {
    isGeneratingFormData,
    isGeneratingForm,
    isSavingForm,
    isGeneratedForm,
  } = state;
  const isBusy =
    isCreatingForm || isGeneratingFormData || isSavingForm || isGeneratingForm;
  const form = useForm<z.infer<typeof generateFormSchema>>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      formOverview: "",
    },
  });

  const formOverview = form.watch("formOverview");
  const { inputRef } = useAutoHeightHook({ value: formOverview });

  async function onSubmit(formData: z.infer<typeof generateFormSchema>) {
    setState({
      ...initialState,
      isGeneratingForm: true,
      isGeneratingFormData: true,
      isSavingForm: true,
    });
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
      }));
      await onFormGenerated({
        ...newFormData,
        formFields: newFormData.formFields,
        isAIGenerated: true,
        isPublished: true,
      });
      setState((cs) => ({
        ...cs,
        isSavingForm: false,
        isGeneratedForm: true,
      }));
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
      setState(initialState);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={isGeneratingFormData ? undefined : setOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-brand-500" /> Generate by AI
          </DialogTitle>
        </DialogHeader>
        {isBusy && (
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              {isGeneratingFormData ? (
                <Spinner />
              ) : (
                <Check className="text-brand-500" />
              )}
              Generate fields
            </div>
            <div className="flex items-center gap-2">
              {isSavingForm ? (
                <Spinner />
              ) : (
                <Check className="text-brand-500" />
              )}
              Save form
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
            {!isBusy && (
              <>
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
                          rows={5}
                          className="overflow-hidden"
                          placeholder="Explain here or choose one of the templates"
                          ref={(e) => {
                            field.ref(e);
                            inputRef.current = e;
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex items-center mb-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Pen className="mr-2 size-4" />
                        Choose Template
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                      <DropdownMenuGroup>
                        {formGenerationTemplates.map(
                          ({ name, description }) => (
                            <DropdownMenuItem
                              key={name}
                              className="cursor-pointer"
                              onClick={() => {
                                form.setValue("formOverview", description);
                              }}
                            >
                              {name}
                            </DropdownMenuItem>
                          ),
                        )}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}

            {isGeneratedForm && (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="size-6 fill-green-100 stroke-green-500" />
                <span>Generated form successfully</span>
              </div>
            )}

            {!isGeneratedForm && (
              <Button type="submit" disabled={isBusy}>
                <span>
                  {isGeneratingForm ? "Generating..." : "Generate Form"}
                </span>
              </Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
