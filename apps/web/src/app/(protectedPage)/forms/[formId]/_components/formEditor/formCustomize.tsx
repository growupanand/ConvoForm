"use client";

import Image from "next/image";
import { Organization } from "@clerk/clerk-sdk-node";
import { Form } from "@convoform/db";
import { Button } from "@convoform/ui/components/ui/button";
import { Label } from "@convoform/ui/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@convoform/ui/components/ui/sheet";
import { Switch } from "@convoform/ui/components/ui/switch";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Palette } from "lucide-react";

import { isRateLimitErrorResponse } from "@/lib/errorHandlers";
import { api } from "@/trpc/react";

type Props = {
  form: Pick<Form, "id" | "showOrganizationName" | "showOrganizationLogo">;
  organization: Pick<Organization, "name" | "imageUrl">;
};

export function FormCustomize({ form, organization }: Readonly<Props>) {
  const queryClient = useQueryClient();

  const params = new URLSearchParams();

  params.set("height", "30");
  params.set("width", "30");
  params.set("quality", "100");
  params.set("fit", "crop");

  const organizationLogoUrl = `${organization.imageUrl}?${params.toString()}`;

  const updateShowOrganizationName =
    api.form.updateShowOrganizationName.useMutation({
      onSuccess: () => {
        toast({
          title: "Changes saved successfully",
          duration: 1500,
        });
        queryClient.invalidateQueries({
          queryKey: [["form"]],
        });
      },
      onError: (error) => {
        toast({
          title: "Unable to save changes",
          duration: 2000,
          variant: "destructive",
          description: isRateLimitErrorResponse(error)
            ? error.message
            : undefined,
        });
      },
    });
  const { isPending: isPendingOrganizationName } = updateShowOrganizationName;

  const handleToggleShowOrganizationName = async (checked: boolean) => {
    await updateShowOrganizationName.mutateAsync({
      formId: form.id,
      showOrganizationName: checked,
      organizationName: organization.name,
    });
  };

  const updateShowOrganizationLogo =
    api.form.updateShowOrganizationLogo.useMutation({
      onSuccess: () => {
        toast({
          title: "Changes saved successfully",
          duration: 1500,
        });
        queryClient.invalidateQueries({
          queryKey: [["form"]],
        });
      },
      onError: (error) => {
        toast({
          title: "Unable to save changes",
          duration: 2000,
          variant: "destructive",
          description: isRateLimitErrorResponse(error)
            ? error.message
            : undefined,
        });
      },
    });
  const { isPending: isPendingOrganizationLogo } = updateShowOrganizationLogo;

  const handleToggleShowOrganizationLogo = async (checked: boolean) => {
    await updateShowOrganizationLogo.mutateAsync({
      formId: form.id,
      showOrganizationLogo: checked,
      organizationLogoUrl: organizationLogoUrl,
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="w-full" variant="outline">
          <Palette className="mr-2 size-4" />
          Customize
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="mb-10">
          <SheetTitle>Customize form</SheetTitle>
        </SheetHeader>
        <div className="grid space-y-5">
          <div className="flex items-start justify-between gap-3 px-2">
            <Label
              htmlFor="showOrganizationNameSwitch"
              className="text-md flex-grow cursor-pointer font-normal"
            >
              <div>Company name</div>
              <div className="text-muted-foreground text-sm">
                Display{" "}
                <span className="font-semibold">{organization.name}</span> on
                the form submission page header
              </div>
            </Label>
            <Switch
              disabled={isPendingOrganizationName}
              defaultChecked={form.showOrganizationName}
              onCheckedChange={handleToggleShowOrganizationName}
              id="showOrganizationNameSwitch"
            />
          </div>
          <div className="flex items-start justify-between gap-3 px-2">
            <Label
              htmlFor="showOrganizationLogoSwitch"
              className="text-md flex-grow cursor-pointer font-normal"
            >
              <div>
                Company logo{" "}
                <Image
                  src={organizationLogoUrl}
                  alt="logo of organization"
                  width={20}
                  height={20}
                  className="ml-2 inline-block"
                />
              </div>
              <div className="text-muted-foreground text-sm">
                Display current organization logo on the form submission page
                header
              </div>
            </Label>
            <Switch
              disabled={isPendingOrganizationLogo}
              defaultChecked={form.showOrganizationLogo}
              onCheckedChange={handleToggleShowOrganizationLogo}
              id="showOrganizationLogoSwitch"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
