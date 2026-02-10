"use client";

import { type Form, patchFormSchema } from "@convoform/db/src/schema";
import {
  Collapsible,
  CollapsibleContent,
  MutedText,
  toast,
} from "@convoform/ui";
import { Label } from "@convoform/ui";
import { Switch } from "@convoform/ui";
import { Textarea } from "@convoform/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { api } from "@/trpc/react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form as UIForm,
} from "@convoform/ui";
import { Input } from "@convoform/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod/v4";

type Props = {
  form: Pick<
    Form,
    | "id"
    | "showCustomEndScreenMessage"
    | "customEndScreenMessage"
    | "endScreenCTAUrl"
    | "endScreenCTALabel"
  >;
};

const formHookSchema = patchFormSchema.omit({ id: true });
type FormHookData = z.infer<typeof formHookSchema>;

export function CustomizeEndScreenCard({ form }: Readonly<Props>) {
  const customEndScreenMessageRef = useRef<string>(
    form.customEndScreenMessage || "",
  );

  const queryClient = useQueryClient();
  const patchForm = api.form.patch.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["form"]],
      });
    },
  });
  const { isPending: isSavingForm } = patchForm;

  function handlePatchPromise(promise: Promise<unknown>) {
    // Show a toast while saving changes
    toast.promise(promise, {
      loading: "Saving changes...",
      success: "Changes saved successfully",
      error: "Unable to save changes",
    });
  }

  const handleToggleShowCustomEndScreenMessage = async (checked: boolean) => {
    const patchPromise = patchForm.mutateAsync({
      id: form.id,
      showCustomEndScreenMessage: checked,
      customEndScreenMessage: customEndScreenMessageRef.current,
    });
    handlePatchPromise(patchPromise);
  };

  const formHook = useForm({
    defaultValues: {
      endScreenCTAUrl: form.endScreenCTAUrl || "",
      endScreenCTALabel: form.endScreenCTALabel || "",
      customEndScreenMessage: form.customEndScreenMessage || "",
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formHookSchema) as any,
  });

  const onSubmit = (data: FormHookData) => {
    const patchPromise = patchForm.mutateAsync({
      id: form.id,
      ...data,
    });
    toast.promise(patchPromise, {
      loading: "Saving changes...",
      success: "Changes saved successfully",
      error: "Unable to save changes",
    });
  };

  const endScreenCTAUrlValue = formHook.watch("endScreenCTAUrl");
  const showEndScreenCTAButtonField = !!endScreenCTAUrlValue;

  useEffect(() => {
    if (endScreenCTAUrlValue === "") {
      // If we want to clear the value we need to set it to null,
      // Otherwise ZOD will throw invalid URL error for empty string
      formHook.setValue("endScreenCTAUrl", null as unknown as string);
    }
    const timeout = setTimeout(() => {
      if (formHook.formState.isDirty) {
        formHook.handleSubmit(onSubmit)();
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [
    endScreenCTAUrlValue,
    formHook.watch("endScreenCTALabel"),
    formHook.watch("customEndScreenMessage"),
  ]);

  return (
    <UIForm {...formHook}>
      <form onSubmit={formHook.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid space-y-4">
          <div className="grid space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="grid space-y-2">
                <Label
                  htmlFor="showCustomEndScreenMessageSwitch"
                  className="cursor-pointer"
                >
                  Custom message
                </Label>
                <MutedText>Display custom text after form submission</MutedText>
              </div>
              <Switch
                disabled={isSavingForm}
                defaultChecked={form.showCustomEndScreenMessage}
                onCheckedChange={handleToggleShowCustomEndScreenMessage}
                id="showCustomEndScreenMessageSwitch"
              />
            </div>
            <Collapsible open={form.showCustomEndScreenMessage}>
              <CollapsibleContent>
                <FormField
                  control={formHook.control}
                  name="customEndScreenMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          disabled={isSavingForm}
                          placeholder="Thank you for filling the form!"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <Textarea
              disabled={isSavingForm}
              // onChange={handleChangeCustomEndScreenMessage}
              placeholder="Thank you for filling the form!"
              defaultValue={customEndScreenMessageRef.current}
            /> */}
              </CollapsibleContent>
            </Collapsible>
          </div>
          <div>
            <FormField
              control={formHook.control}
              name="endScreenCTAUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CTA Button URL (Optional)</FormLabel>
                  <FormDescription>
                    Navigate to your website after form submission
                  </FormDescription>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="E.g https://yoursite.com"
                      disabled={isSavingForm}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showEndScreenCTAButtonField && (
              <FormField
                control={formHook.control}
                name="endScreenCTALabel"
                render={({ field }) => (
                  <FormItem>
                    <FormDescription>
                      CTA Button Text (Optional)
                    </FormDescription>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Default: Done"
                        disabled={isSavingForm}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
      </form>
    </UIForm>
  );
}
