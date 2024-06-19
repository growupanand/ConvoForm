"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  newFormSchema,
  Workspace,
} from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@convoform/ui/components/ui/dropdown-menu";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { Loader2, PenLine, Plus, Sparkles } from "lucide-react";
import { z } from "zod";

import { montserrat } from "@/app/fonts";
import { isRateLimitErrorResponse } from "@/lib/errorHandlers";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { GenerateFormModal } from "./generateFormModal";

type Props = {
  workspace: Workspace;
};

export type HandleCreateForm = (
  formData: z.infer<typeof newFormSchema>,
) => void;

const newFormFields: z.infer<typeof newFormSchema>["formFields"] = [
  {
    fieldName: "Name",
    fieldDescription: "Description of the field",
  },
];

const newFormData: z.infer<typeof newFormSchema> = newFormSchema.parse({
  name: "New form",
  welcomeScreenTitle: "Welcome to your new form!",
  welcomeScreenMessage: "Customize your form.",
  welcomeScreenCTALabel: "Start",
  overview:
    "This is brief description about the form, which will be used while generating questions.",
  formFields: newFormFields,
});

export default function CreateFormButton({ workspace }: Readonly<Props>) {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const createForm = api.form.create.useMutation({
    onSuccess: async (newForm) => {
      toast({
        title: "Form created",
        duration: 1500,
      });
      router.push(`/forms/${newForm.id}`);
    },
    onError: (error) => {
      toast({
        title: "Unable to create form",
        duration: 2000,
        variant: "destructive",
        description: isRateLimitErrorResponse(error)
          ? error.message
          : undefined,
      });
    },
  });
  const { isPending: isCreatingForm } = createForm;

  const handleCreateForm: HandleCreateForm = (formData) => {
    createForm.mutate({
      ...formData,
      workspaceId: workspace.id,
      organizationId: workspace.organizationId,
    });
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className={cn(montserrat.className, "cursor-pointer font-semibold")}
          >
            {isCreatingForm && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {!isCreatingForm && <Plus className="mr-2 h-4 w-4" />}
            <span>New Form</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className=" p-3" align="start">
          <DropdownMenuGroup className="grid gap-2">
            <DropdownMenuItem
              className={cn(
                montserrat.className,
                "cursor-pointer px-3 font-semibold",
              )}
              disabled={isCreatingForm}
              onClick={() => handleCreateForm(newFormData)}
            >
              <PenLine size={16} className="mr-2" />
              <span>Create form Scratch</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isCreatingForm}
              className={cn(
                montserrat.className,
                "cursor-pointer px-3 font-semibold",
              )}
              onClick={() => setOpen(true)}
            >
              <Sparkles size={16} className="mr-2" />

              <span>Generate using AI</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <GenerateFormModal
        isCreatingForm={isCreatingForm}
        onFormGenerated={handleCreateForm}
        open={open}
        setOpen={setOpen}
      />
    </div>
  );
}
