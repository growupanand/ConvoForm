"use client";

import type { Form } from "@convoform/db/src/schema";

import { sonnerToast } from "@convoform/ui/components/ui/sonner";

import { ToggleButton } from "@/components/common/toggleButton";
import { api } from "@/trpc/react";
import { Pen, PenOff } from "lucide-react";
import { useState } from "react";

type Props = {
  form: Pick<Form, "isPublished" | "id">;
};

export function FormPublishToggle({ form }: Readonly<Props>) {
  const [isPublished, setIsPublished] = useState(form.isPublished);
  const updateFormIsPublished = api.form.updateIsPublished.useMutation();

  const { isPending: isPendingUpdateFormIsPublished } = updateFormIsPublished;

  async function toggleIsFormPublished(checked: boolean): Promise<void> {
    setIsPublished(checked);
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
    <ToggleButton
      label={!isPublished ? "Not published" : "Published"}
      labelClass="text-xl font-bold tracking-tight "
      id="isFormPublished"
      defaultChecked={form.isPublished}
      disabled={isPendingUpdateFormIsPublished}
      onCheckedChange={toggleIsFormPublished}
      icon={!isPublished ? <PenOff className=" text-red-400" /> : <Pen />}
    />
  );
}
