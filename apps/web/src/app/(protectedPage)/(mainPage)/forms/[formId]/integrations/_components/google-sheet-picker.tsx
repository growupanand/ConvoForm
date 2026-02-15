"use client";
import { useGoogleAuth } from "@/contexts/GoogleAuthContext";
import { Button } from "@convoform/ui";
import { toast } from "@convoform/ui";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

interface GoogleSheetPickerProps {
  onSelect: (id: string, name: string, token: string) => void;
  disabled?: boolean;
}

export function GoogleSheetPicker({
  onSelect,
  disabled,
}: GoogleSheetPickerProps) {
  const { getAccessToken, isAuthenticating } = useGoogleAuth();
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  const pickerRef = useRef<any>(null);

  // Load Google Picker API
  useEffect(() => {
    // @ts-ignore
    if (window.gapi && window.google?.picker) {
      setGoogleApiLoaded(true);
    }
  }, []);

  const handleGoogleApiLoad = () => {
    // @ts-ignore
    window.gapi.load("picker", () => {
      setGoogleApiLoaded(true);
    });
  };

  const handlePick = async () => {
    if (!googleApiLoaded) {
      toast.error("Google API is loading...");
      return;
    }

    try {
      const token = await getAccessToken();

      if (!pickerRef.current) {
        const appId =
          process.env.NEXT_PUBLIC_GOOGLE_APP_ID ||
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.split("-")[0] ||
          "";
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "";

        const view = new window.google.picker.DocsView(
          window.google.picker.ViewId.DOCS,
        )
          .setMimeTypes("application/vnd.google-apps.spreadsheet")
          .setIncludeFolders(true)
          .setSelectFolderEnabled(true);

        // @ts-ignore
        const builder = new window.google.picker.PickerBuilder()
          .addView(view)
          .setOAuthToken(token)
          .setAppId(appId)
          .setOrigin(`${window.location.protocol}//${window.location.host}`);

        if (apiKey) {
          builder.setDeveloperKey(apiKey);
        }

        const picker = builder
          .setCallback((data: any) => {
            console.log("Picker Result:", data);
            if (data.action === window.google.picker.Action.PICKED) {
              const doc = data.docs[0];
              onSelect(doc.id, doc.name, token);
            }
          })
          .build();

        picker.setVisible(true);
        pickerRef.current = picker;
      }

      // Re-set token in case it refreshed
      pickerRef.current.setVisible(true);
    } catch (error) {
      console.error("Picker error", error);
      toast.error("Failed to open Google Picker");
    }
  };

  return (
    <div>
      <Script
        src="https://apis.google.com/js/api.js"
        onLoad={handleGoogleApiLoad}
      />
      <Button
        variant="outline"
        onClick={handlePick}
        disabled={disabled || isAuthenticating || !googleApiLoaded}
      >
        {isAuthenticating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="mr-2 h-4 w-4" />
        )}
        Select Existing Sheet
      </Button>
    </div>
  );
}
