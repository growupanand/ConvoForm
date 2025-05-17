"use client";

import type { Form } from "@convoform/db/src/schema";

import Spinner from "@/components/common/spinner";
import { ToggleButton } from "@/components/common/toggleButton";
import { api } from "@/trpc/react";
import { toast } from "@convoform/ui";
import { Eye, EyeOff } from "lucide-react";
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

    toast.promise(updateFormPromise, {
      loading: "Saving changes...",
      success: "Changes saved successfully",
      error: "Unable to save changes",
    });
  }

  const getIcon = () => {
    if (isPendingUpdateFormIsPublished) {
      return <Spinner />;
    }
    if (isPublished) {
      return <Eye />;
    }
    return <EyeOff className="text-destructive" />;
  };

  return (
    <ToggleButton
      label={isPublished ? "Published" : "Unpublished"}
      icon={getIcon()}
      labelClass={isPublished ? "" : " text-muted-foreground"}
      id="isFormPublished"
      switchProps={{
        defaultChecked: form.isPublished,
        disabled: isPendingUpdateFormIsPublished,
        onCheckedChange: toggleIsFormPublished,
      }}
    />
  );
}
