"use client";

import { useRouter } from "next/navigation";
import { Workspace } from "@convoform/db";
import { Button } from "@convoform/ui/components/ui/button";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { Loader2, Plus } from "lucide-react";
import { z } from "zod";

import { montserrat } from "@/app/fonts";
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
  const router = useRouter();
  const createForm = api.form.create.useMutation({
    onSuccess: async (newForm) => {
      toast({
        title: "Form created",
        duration: 1500,
      });
      router.push(`/forms/${newForm.id}`);
    },
    onError: () => {
      toast({
        title: "Unable to create form",
      });
    },
  });
  const { isPending: isCreatingForm } = createForm;

  const handleCreateForm = async (
    formData: z.infer<typeof createFormSchema>,
  ) => {
    console.log("saving form to database", { formData });
    await createForm.mutateAsync({
      ...formData,
      workspaceId: workspace.id,
      organizationId: workspace.organizationId,
    });
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-start gap-3">
        <Button
          variant="secondary"
          disabled={isCreatingForm}
          onClick={() => handleCreateForm(newFormData)}
          className={cn(montserrat.className, "font-semibold")}
        >
          {isCreatingForm && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!isCreatingForm && <Plus className="mr-2 h-4 w-4" />}
          New Form
        </Button>
        <GenerateForm
          isCreatingForm={isCreatingForm}
          onFormGenerated={handleCreateForm}
        />
      </div>
    </div>
  );
}
