"use client";

import { GoogleSheetPicker } from "@/app/(protectedPage)/(mainPage)/forms/[formId]/integrations/_components/google-sheet-picker";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  Switch,
  toast,
} from "@convoform/ui";
import { Zap } from "lucide-react";

export default function FormIntegrationsSettings({
  formId,
}: { formId: string }) {
  // 1. Get user's connected integrations (to know what is available)
  const { data: userIntegrations, isLoading: isLoadingUserIntegrations } =
    api.integration.list.useQuery(undefined, {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    });

  // 2. Get form's current integration config
  const {
    data: formIntegrations,
    isLoading: isLoadingFormIntegrations,
    refetch,
  } = api.integration.listForForm.useQuery({ formId });

  const manageMutation = api.integration.manage.useMutation({
    onSuccess: () => {
      toast.success("Settings saved");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  if (isLoadingUserIntegrations || isLoadingFormIntegrations) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const googleSheetsIntegration = userIntegrations?.find(
    (i) => i.id === "google_sheets",
  );
  const formGoogleSheet = formIntegrations?.find(
    (i) => i.integration?.provider === "google_sheets",
  );

  const isConnected = !!googleSheetsIntegration?.connected;
  const isEnabled = formGoogleSheet?.enabled ?? false;
  const config = (formGoogleSheet?.config as { spreadsheetId?: string }) || {};

  const handleToggle = (checked: boolean) => {
    if (!isConnected) {
      toast.error("You must connect Google Sheets in account settings first");
      return;
    }
    manageMutation.mutate({
      formId,
      provider: "google_sheets",
      enabled: checked,
      config,
    });
  };

  const handleSaveConfig = (spreadsheetId: string) => {
    manageMutation.mutate({
      formId,
      provider: "google_sheets",
      enabled: isEnabled,
      config: { ...config, spreadsheetId },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-full">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Google Sheets</CardTitle>
                <CardDescription>
                  Sync responses to a Google Sheet
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={!isConnected || manageMutation.isPending}
            />
          </div>
        </CardHeader>
        {isEnabled && (
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="spreadsheetId">Spreadsheet ID</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  id="spreadsheetId"
                  placeholder="Enter Google Spreadsheet ID"
                  defaultValue={config.spreadsheetId}
                  onBlur={(e) => handleSaveConfig(e.target.value)}
                />
              </div>
              <p className="text-[0.8rem] text-muted-foreground">
                Leave blank to auto-create a new spreadsheet on first response.
              </p>
              <GoogleSheetPicker
                onSelect={(id, _name, token) => {
                  const input = document.getElementById(
                    "spreadsheetId",
                  ) as HTMLInputElement;
                  if (input) input.value = id;
                  // Pass the temporary token to backend to "touch" the file
                  manageMutation.mutate({
                    formId,
                    provider: "google_sheets",
                    enabled: isEnabled,
                    config: {
                      ...config,
                      spreadsheetId: id,
                      temporaryAccessToken: token,
                    },
                  });
                }}
              />
              <div className="text-sm text-muted-foreground pt-2 border-t">
                <p>
                  To manually link a sheet, copy the ID from the URL:
                  <code className="bg-muted px-1 py-0.5 rounded text-xs ml-1 inline-block">
                    .../d/<span className="font-bold">SPREADSHEET_ID</span>/edit
                  </code>
                </p>
              </div>
            </div>
          </CardContent>
        )}
        {!isConnected && (
          <CardContent>
            <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
              You need to connect Google Drive in your{" "}
              <a href="/settings/integrations" className="underline">
                Account Settings
              </a>{" "}
              to use this integration.
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
