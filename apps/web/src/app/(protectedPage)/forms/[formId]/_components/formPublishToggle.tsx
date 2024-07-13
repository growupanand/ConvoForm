"use client";

import { Form } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";
import { Label } from "@convoform/ui/components/ui/label";
import { sonnerToast } from "@convoform/ui/components/ui/sonner";
import { Switch } from "@convoform/ui/components/ui/switch";

import { api } from "@/trpc/react";

type Props = {
  form: Pick<Form, "isPublished" | "id">;
};

export function FormPublishToggle({ form }: Readonly<Props>) {
  const updateFormIsPublished = api.form.updateIsPublished.useMutation();

  const { isPending: isPendingUpdateFormIsPublished } = updateFormIsPublished;

  async function toggleIsFormPublished(checked: boolean): Promise<void> {
    const updateFormPromise = updateFormIsPublished.mutateAsync({
      formId: form.id,
      isPublished: checked,
    });

    sonnerToast.promise(updateFormPromise, {
      loading: "Saving changes...",
      success: "Changes saved successfully",
      error: "Unable to save changes",
    });
  }
  return (
    <Label htmlFor="isFormPublished">
      <Button
        size="lg"
        variant="ghost"
        className="text-md cursor-pointer rounded-full"
        asChild
      >
        <div className="flex w-full items-center justify-between">
          Make form public
          <Switch
            defaultChecked={form.isPublished}
            onCheckedChange={toggleIsFormPublished}
            id="isFormPublished"
            disabled={isPendingUpdateFormIsPublished}
          />
        </div>
      </Button>
    </Label>
  );
}
