"use client";

import type { Organization } from "@clerk/clerk-sdk-node";
import type { Form } from "@convoform/db/src/schema";
import { Label } from "@convoform/ui";
import { sonnerToast } from "@convoform/ui";
import { Switch } from "@convoform/ui";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

import { api } from "@/trpc/react";

type Props = {
  form: Pick<Form, "id" | "showOrganizationName" | "showOrganizationLogo">;
  organization: Pick<Organization, "name" | "imageUrl">;
};

export function CustomizeFormCard({ form, organization }: Readonly<Props>) {
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
    </div>
  );
}
