"use client";

import { useRef } from "react";
import Image from "next/image";
import { Organization } from "@clerk/clerk-sdk-node";
import { Form } from "@convoform/db/src/schema";
import {
  Collapsible,
  CollapsibleContent,
} from "@convoform/ui/components/ui/collapsible";
import { Label } from "@convoform/ui/components/ui/label";
import { sonnerToast } from "@convoform/ui/components/ui/sonner";
import { Switch } from "@convoform/ui/components/ui/switch";
import { Textarea } from "@convoform/ui/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";

import { debounce } from "@/lib/utils";
import { api } from "@/trpc/react";

type Props = {
  form: Pick<
    Form,
    | "id"
    | "showOrganizationName"
    | "showOrganizationLogo"
    | "showCustomEndScreenMessage"
    | "customEndScreenMessage"
  >;
  organization: Pick<Organization, "name" | "imageUrl">;
};

export function FormCustomizeCard({ form, organization }: Readonly<Props>) {
  const customEndScreenMessageRef = useRef<string>(
    form.customEndScreenMessage || "",
  );

  const queryClient = useQueryClient();

  const params = new URLSearchParams();

  params.set("height", "30");
  params.set("width", "30");
  params.set("quality", "100");
  params.set("fit", "crop");

  const organizationLogoUrl = `${organization.imageUrl}?${params.toString()}`;

  function showPromiseSonner(promise: Promise<unknown>) {
    sonnerToast.promise(promise, {
      loading: "Saving changes...",
      success: "Changes saved successfully",
      error: "Unable to save changes",
    });
  }

  const updateShowOrganizationName =
    api.form.updateShowOrganizationName.useMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["form"]],
        });
      },
    });
  const { isPending: isPendingOrganizationName } = updateShowOrganizationName;

  const handleToggleShowOrganizationName = async (checked: boolean) =>
    showPromiseSonner(
      updateShowOrganizationName.mutateAsync({
        formId: form.id,
        showOrganizationName: checked,
        organizationName: organization.name,
      }),
    );

  const updateShowOrganizationLogo =
    api.form.updateShowOrganizationLogo.useMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["form"]],
        });
      },
    });
  const { isPending: isPendingOrganizationLogo } = updateShowOrganizationLogo;

  const handleToggleShowOrganizationLogo = async (checked: boolean) =>
    showPromiseSonner(
      updateShowOrganizationLogo.mutateAsync({
        formId: form.id,
        showOrganizationLogo: checked,
        organizationLogoUrl: organizationLogoUrl,
      }),
    );

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
      <div>
        <div className="flex items-start justify-between">
          <div className="grid space-y-2">
            <Label
              htmlFor="showOrganizationNameSwitch"
              className="cursor-pointer "
            >
              Company name
            </Label>
            <div className="text-muted-foreground text-sm">
              Display <span className="font-semibold">{organization.name}</span>{" "}
              on the form submission page header
            </div>
          </div>
          <Switch
            disabled={isPendingOrganizationName}
            defaultChecked={form.showOrganizationName}
            onCheckedChange={handleToggleShowOrganizationName}
            id="showOrganizationNameSwitch"
          />
        </div>
      </div>
      <div>
        <div className="flex items-start justify-between ">
          <div className="grid space-y-2">
            <Label
              htmlFor="showOrganizationLogoSwitch"
              className="cursor-pointer"
            >
              Company logo
              <Image
                src={organizationLogoUrl}
                alt="logo of organization"
                width={20}
                height={20}
                className="ml-2 inline-block"
              />
            </Label>
            <div className="text-muted-foreground text-sm">
              Display current organization logo on the form submission page
              header
            </div>
          </div>
          <Switch
            disabled={isPendingOrganizationLogo}
            defaultChecked={form.showOrganizationLogo}
            onCheckedChange={handleToggleShowOrganizationLogo}
            id="showOrganizationLogoSwitch"
          />
        </div>
      </div>
      <div className="grid space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="grid space-y-2">
            <Label
              htmlFor="showCustomEndScreenMessageSwitch"
              className="cursor-pointer"
            >
              End screen message
            </Label>
            <div className="text-muted-foreground text-sm">
              Display custom message after form submission
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
