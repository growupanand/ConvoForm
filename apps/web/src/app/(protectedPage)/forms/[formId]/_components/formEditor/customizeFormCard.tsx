"use client";

import type { Form } from "@convoform/db/src/schema";
import {
  Badge,
  Label,
  MutedText,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  toast,
} from "@convoform/ui";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

import { api } from "@/trpc/react";
import type { Organization } from "@clerk/nextjs/server";

type Props = {
  form: Pick<
    Form,
    | "id"
    | "showOrganizationName"
    | "showOrganizationLogo"
    | "answerCheckProvider"
  >;
  organization: Pick<Organization, "name" | "imageUrl">;
};

type FormCacheData = {
  id?: string;
  answerCheckProvider?: string;
};

function isFormCacheData(data: unknown): data is FormCacheData {
  return typeof data === "object" && data !== null && "id" in data;
}

export function CustomizeFormCard({ form, organization }: Readonly<Props>) {
  const queryClient = useQueryClient();

  const params = new URLSearchParams();

  params.set("height", "30");
  params.set("width", "30");
  params.set("quality", "100");
  params.set("fit", "crop");

  const organizationLogoUrl = `${organization.imageUrl}?${params.toString()}`;

  function showPromiseSonner(promise: Promise<unknown>) {
    toast.promise(promise, {
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

  const updateAnswerCheckProvider =
    api.form.updateAnswerCheckProvider.useMutation({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: [["form"]],
        });

        const previousForms = queryClient.getQueriesData({
          queryKey: [["form"]],
        });

        queryClient.setQueriesData(
          {
            queryKey: [["form"]],
          },
          (oldData) => {
            if (isFormCacheData(oldData) && oldData.id === variables.formId) {
              return {
                ...oldData,
                answerCheckProvider: variables.answerCheckProvider,
              };
            }

            return oldData;
          },
        );

        return { previousForms };
      },
      onError: (_error, _variables, context) => {
        for (const [queryKey, data] of context?.previousForms ?? []) {
          queryClient.setQueryData(queryKey, data);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: [["form"]],
        });
      },
    });
  const { isPending: isPendingAnswerCheckProvider } = updateAnswerCheckProvider;

  const handleToggleAnswerCheck = async (checked: boolean) =>
    showPromiseSonner(
      updateAnswerCheckProvider.mutateAsync({
        formId: form.id,
        answerCheckProvider: checked ? "cloudflare-clef" : "none",
      }),
    );

  const handleAnswerCheckProviderChange = async (value: string) => {
    if (value !== "cloudflare-clef" && value !== "llm") {
      return;
    }

    await showPromiseSonner(
      updateAnswerCheckProvider.mutateAsync({
        formId: form.id,
        answerCheckProvider: value,
      }),
    );
  };

  const isAnswerCheckEnabled = form.answerCheckProvider !== "none";

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
            <MutedText>
              Display <span className="font-semibold">{organization.name}</span>{" "}
              on the form submission page header
            </MutedText>
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
            <MutedText>
              Display current organization logo on the form submission page
              header
            </MutedText>
          </div>
          <Switch
            disabled={isPendingOrganizationLogo}
            defaultChecked={form.showOrganizationLogo}
            onCheckedChange={handleToggleShowOrganizationLogo}
            id="showOrganizationLogoSwitch"
          />
        </div>
      </div>
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="grid min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Label
                htmlFor="answerCheckProviderSwitch"
                className="cursor-pointer"
              >
                Smart follow-ups
              </Label>
              <Badge variant="secondary">Experimental</Badge>
            </div>
            <MutedText>
              Asks a short follow-up when an answer is too vague to use. Answers
              are sent to the selected AI provider for this check.
            </MutedText>
          </div>
          <label className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-end">
            <Switch
              id="answerCheckProviderSwitch"
              checked={isAnswerCheckEnabled}
              disabled={isPendingAnswerCheckProvider}
              onCheckedChange={handleToggleAnswerCheck}
            />
          </label>
        </div>
        {isAnswerCheckEnabled && (
          <Select
            value={form.answerCheckProvider}
            onValueChange={handleAnswerCheckProviderChange}
            disabled={isPendingAnswerCheckProvider}
          >
            <SelectTrigger
              className="mt-3 h-11 w-full sm:max-w-[280px]"
              aria-label="Smart follow-up provider"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cloudflare-clef" className="min-h-11">
                Cloudflare Clef (recommended)
              </SelectItem>
              <SelectItem value="llm" className="min-h-11">
                LLM
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
