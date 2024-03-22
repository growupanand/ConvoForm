"use client";

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
  form: Pick<Form, "id" | "showOrganizationName">;
  organization: Pick<Organization, "name">;
};

export function FormCustomize({ form, organization }: Readonly<Props>) {
  const queryClient = useQueryClient();

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
  const { isPending } = updateShowOrganizationName;

  const handleToggleShowOrganizationName = async (checked: boolean) => {
    await updateShowOrganizationName.mutateAsync({
      formId: form.id,
      showOrganizationName: checked,
      organizationName: organization.name,
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
        <SheetHeader className="mb-5">
          <SheetTitle>Customize form</SheetTitle>
        </SheetHeader>
        <div className="flex items-start justify-between gap-3 px-2">
          <Label
            htmlFor="showOrganizationNameSwitch"
            className="text-md flex-grow cursor-pointer font-normal"
          >
            <div>Show Company name</div>
            <div className="text-muted-foreground text-sm">
              Display <span className="font-semibold">{organization.name}</span>{" "}
              on the form submission page
            </div>
          </Label>
          <Switch
            disabled={isPending}
            defaultChecked={form.showOrganizationName}
            onCheckedChange={handleToggleShowOrganizationName}
            id="showOrganizationNameSwitch"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
