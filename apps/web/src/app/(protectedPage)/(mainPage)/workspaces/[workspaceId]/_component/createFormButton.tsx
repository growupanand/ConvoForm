"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Workspace } from "@convoform/db";
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
import { isRateLimitError } from "@/lib/errorHandlers";
import { cn } from "@/lib/utils";
import { createFormSchema } from "@/lib/validations/form";
import { api } from "@/trpc/react";
import { GenerateForm } from "./generateForm";

type Props = {
  workspace: Workspace;
};

const newFormData = createFormSchema.parse({
  name: "New form",
  welcomeScreenTitle: "",
  welcomeScreenMessage: "",
  welcomeScreenCTALabel: "",
  overview: "",
  formField: [
    {
      fieldName: "",
    },
  ],
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
        description: isRateLimitError(error) ? error.message : undefined,
      });
    },
  });
  const { isPending: isCreatingForm } = createForm;

  const handleCreateForm = async (
    formData: z.infer<typeof createFormSchema>,
  ) => {
    await createForm.mutateAsync({
      ...formData,
      workspaceId: workspace.id,
      organizationId: workspace.organizationId,
    });
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-start gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className={cn(
                montserrat.className,
                "cursor-pointer font-semibold",
              )}
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

        <GenerateForm
          isCreatingForm={isCreatingForm}
          onFormGenerated={handleCreateForm}
          open={open}
          setOpen={setOpen}
        />
      </div>
    </div>
  );
}
