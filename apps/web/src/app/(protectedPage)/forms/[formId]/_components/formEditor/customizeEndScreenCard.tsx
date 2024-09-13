"use client";

import type { Form } from "@convoform/db/src/schema";
import {
  Collapsible,
  CollapsibleContent,
} from "@convoform/ui/components/ui/collapsible";
import { Label } from "@convoform/ui/components/ui/label";
import { sonnerToast } from "@convoform/ui/components/ui/sonner";
import { Switch } from "@convoform/ui/components/ui/switch";
import { Textarea } from "@convoform/ui/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import { debounce } from "@/lib/utils";
import { api } from "@/trpc/react";

type Props = {
  form: Pick<
    Form,
    "id" | "showCustomEndScreenMessage" | "customEndScreenMessage"
  >;
};

export function CustomizeEndScreenCard({ form }: Readonly<Props>) {
  const customEndScreenMessageRef = useRef<string>(
    form.customEndScreenMessage || "",
  );

  const queryClient = useQueryClient();

  function showPromiseSonner(promise: Promise<unknown>) {
    sonnerToast.promise(promise, {
      loading: "Saving changes...",
      success: "Changes saved successfully",
      error: "Unable to save changes",
    });
  }

  const updateShowCustomEndScreenMessage =
    api.form.updateShowCustomEndScreenMessage.useMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["form"]],
        });
      },
    });
  const { isPending: isPendingCustomEndScreenMessage } =
    updateShowCustomEndScreenMessage;

  const handleToggleShowCustomEndScreenMessage = async (checked: boolean) =>
    showPromiseSonner(
      updateShowCustomEndScreenMessage.mutateAsync({
        formId: form.id,
        showCustomEndScreenMessage: checked,
        customEndScreenMessage: customEndScreenMessageRef.current,
      }),
    );

  const handleChangeCustomEndScreenMessage = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const updatedCustomEndMessage = e.target.value as string;
    customEndScreenMessageRef.current = updatedCustomEndMessage;
    debounce(() => {
      if (customEndScreenMessageRef.current !== form.customEndScreenMessage) {
        handleToggleShowCustomEndScreenMessage(form.showCustomEndScreenMessage);
      }
    }, 1000);
  };

  return (
    <div className="grid space-y-8">
      <div className="grid space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="grid space-y-2">
            <Label
              htmlFor="showCustomEndScreenMessageSwitch"
              className="cursor-pointer"
            >
              Custom message
            </Label>
            <div className="text-muted-foreground text-sm">
              Display custom text after form submission
            </div>
            <Collapsible open={form.showCustomEndScreenMessage}>
              <CollapsibleContent>
                <Textarea
                  disabled={isPendingCustomEndScreenMessage}
                  onChange={handleChangeCustomEndScreenMessage}
                  placeholder="Thank you for filling the form!"
                  defaultValue={customEndScreenMessageRef.current}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>
          <Switch
            disabled={isPendingCustomEndScreenMessage}
            defaultChecked={form.showCustomEndScreenMessage}
            onCheckedChange={handleToggleShowCustomEndScreenMessage}
            id="showCustomEndScreenMessageSwitch"
          />
        </div>
      </div>
    </div>
  );
}
