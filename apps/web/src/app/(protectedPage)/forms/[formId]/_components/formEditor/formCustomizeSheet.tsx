"use client";

import { useRef } from "react";
import Image from "next/image";
import { Organization } from "@clerk/clerk-sdk-node";
import { Form } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
} from "@convoform/ui/components/ui/collapsible";
import { Label } from "@convoform/ui/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@convoform/ui/components/ui/sheet";
import { Switch } from "@convoform/ui/components/ui/switch";
import { Textarea } from "@convoform/ui/components/ui/textarea";
import {
  showErrorResponseToast,
  toast,
} from "@convoform/ui/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Palette } from "lucide-react";

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

export function FormCustomizeSheet({ form, organization }: Readonly<Props>) {
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
        showErrorResponseToast(error, "Unable to save changes");
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
        showErrorResponseToast(error, "Unable to save changes");
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

  const updateShowCustomEndScreenMessage =
    api.form.updateShowCustomEndScreenMessage.useMutation({
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
        showErrorResponseToast(error, "Unable to save changes");
      },
    });
  const { isPending: isPendingCustomEndScreenMessage } =
    updateShowCustomEndScreenMessage;

  const handleToggleShowCustomEndScreenMessage = async (checked: boolean) => {
    await updateShowCustomEndScreenMessage.mutateAsync({
      formId: form.id,
      showCustomEndScreenMessage: checked,
      customEndScreenMessage: customEndScreenMessageRef.current,
    });
  };

  const handleChangeCustomEndScreenMessage = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const updatedCustomEndMessage = e.target.value as string;
    console.log(updatedCustomEndMessage);
    customEndScreenMessageRef.current = updatedCustomEndMessage;
    debounce(() => {
      if (customEndScreenMessageRef.current !== form.customEndScreenMessage) {
        handleToggleShowCustomEndScreenMessage(form.showCustomEndScreenMessage);
      }
    }, 1000);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Palette className="mr-2 size-4" />
          Customize
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="mb-10">
          <SheetTitle>Customize</SheetTitle>
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
          <div className="px-2">
            <div className="mb-2 flex items-start justify-between gap-3">
              <Label
                htmlFor="showCustomEndScreenMessageSwitch"
                className="text-md flex-grow cursor-pointer font-normal"
              >
                <div>End screen message</div>
                <div className="text-muted-foreground text-sm">
                  Display custom message after form submission
                </div>
              </Label>
              <Switch
                disabled={isPendingCustomEndScreenMessage}
                defaultChecked={form.showCustomEndScreenMessage}
                onCheckedChange={handleToggleShowCustomEndScreenMessage}
                id="showCustomEndScreenMessageSwitch"
              />
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
