"use client";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
  toast,
} from "@convoform/ui";
import { useQueryClient } from "@tanstack/react-query";

import { api } from "@/trpc/react";

type Props = {
  formId: string;
};

type FormCacheData = {
  id?: string;
  answerCheckProvider?: string;
};

function isFormCacheData(data: unknown): data is FormCacheData {
  return typeof data === "object" && data !== null && "id" in data;
}

export function SmartFollowUpsSettings({ formId }: Readonly<Props>) {
  const queryClient = useQueryClient();

  const { data: form, isLoading } = api.form.getOne.useQuery({ id: formId });

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
  const { isPending } = updateAnswerCheckProvider;

  function showPromiseSonner(promise: Promise<unknown>) {
    toast.promise(promise, {
      loading: "Saving changes...",
      success: "Changes saved successfully",
      error: "Unable to save changes",
    });
  }

  const handleToggleAnswerCheck = async (checked: boolean) =>
    showPromiseSonner(
      updateAnswerCheckProvider.mutateAsync({
        formId,
        answerCheckProvider: checked ? "cloudflare-clef" : "none",
      }),
    );

  const handleAnswerCheckProviderChange = async (value: string) => {
    if (value !== "cloudflare-clef" && value !== "llm") {
      return;
    }

    await showPromiseSonner(
      updateAnswerCheckProvider.mutateAsync({
        formId,
        answerCheckProvider: value,
      }),
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="grid space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!form) {
    return null;
  }

  const answerCheckProvider = form.answerCheckProvider ?? "none";
  const isAnswerCheckEnabled = answerCheckProvider !== "none";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="grid min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">
                <Label
                  htmlFor="answerCheckProviderSwitch"
                  className="cursor-pointer text-base font-semibold"
                >
                  Smart follow-ups
                </Label>
              </CardTitle>
              <Badge variant="secondary">Experimental</Badge>
            </div>
            <CardDescription>
              Asks a short follow-up when an answer is too vague to use. Answers
              are sent to the selected AI provider for this check.
            </CardDescription>
          </div>
          <label className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-end">
            <Switch
              id="answerCheckProviderSwitch"
              checked={isAnswerCheckEnabled}
              disabled={isPending}
              onCheckedChange={handleToggleAnswerCheck}
            />
          </label>
        </div>
      </CardHeader>
      {isAnswerCheckEnabled && (
        <CardContent className="pt-0">
          <Select
            value={answerCheckProvider}
            onValueChange={handleAnswerCheckProviderChange}
            disabled={isPending}
          >
            <SelectTrigger
              className="h-11 w-full sm:max-w-[300px]"
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
        </CardContent>
      )}
    </Card>
  );
}
