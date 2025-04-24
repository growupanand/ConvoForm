"use client";
import { useGoogleAuth } from "@/contexts/GoogleAuthContext";
import { api } from "@/trpc/react";
import { Button, toast } from "@convoform/ui";
import Script from "next/script";

import { FileText, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  type GoogleDriveFormMeta,
  type Workspace,
  convertGoogleFormToNewForm,
} from "@convoform/db/src/schema";
import { useRouter } from "next/navigation";

type Props = {
  workspace: Workspace;
};

export default function ImportGoogleFormButton({ workspace }: Props) {
  const router = useRouter();

  const { getAccessToken, isAuthenticating } = useGoogleAuth();
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
  const googlePickerRef = useRef<google.picker.Picker | undefined>(undefined);

  // Check if Google API is already loaded when component mounts
  useEffect(() => {
    // Check if the Google API is already available
    // @ts-ignore
    if (window.gapi && window.google?.picker) {
      setGoogleApiLoaded(true);
      return;
    }

    // If gapi exists but picker isn't loaded yet, load it
    // @ts-ignore
    if (window.gapi && !window.google?.picker) {
      // @ts-ignore
      window.gapi.load("picker", () => {
        setGoogleApiLoaded(true);
      });
    }
  }, []);

  const handleGoogleApiLoad = () => {
    // Initialize the picker API when the script loads
    // @ts-ignore
    window.gapi.load("picker", () => {
      setGoogleApiLoaded(true);
    });
  };

  const createFormMutation = api.form.create.useMutation({
    onSuccess: async (newForm) => {
      router.push(`/forms/${newForm.id}`);
    },
  });

  const googleFormMutation = api.google.getGoogleForm.useMutation({
    meta: {
      allowRetry: true,
    },
  });

  // Fetch Google Forms from user's drive
  const fetchGoogleForms = async () => {
    if (!googleApiLoaded) {
      toast.error("Google API is still loading. Please try again in a moment.");
      return;
    }

    try {
      const accessToken = await getAccessToken();
      if (!googlePickerRef.current) {
        googlePickerRef.current = new window.google.picker.PickerBuilder()
          .setOAuthToken(accessToken)
          .setAppId(process.env.GOOGLE_CLIENT_ID ?? "")
          .addView(window.google.picker.ViewId.FORMS)
          .setCallback((data) => {
            if (data.action === "picked" && data.docs && data.docs[0]) {
              const createFormPromise = handleImportForm(
                accessToken,
                data.docs[0],
              );

              toast.promise(createFormPromise, {
                loading: "Creating form...",
                success: "Form created successfully",
                error: "Failed to create form",
              });
            }
          })
          .build();
      }

      googlePickerRef.current.setVisible(true);
    } catch (error) {
      toast.error("Authentication failed", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to authenticate with Google",
      });
    }
  };

  // Handle form import
  const handleImportForm = async (
    accessToken: string,
    formMeta: Pick<GoogleDriveFormMeta, "id">,
  ) => {
    const googleFormDetails = await googleFormMutation.mutateAsync({
      accessToken,
      formId: formMeta.id,
    });
    const newForm = {
      ...convertGoogleFormToNewForm(googleFormDetails),
      workspaceId: workspace.id,
      organizationId: workspace.organizationId,
    };
    await createFormMutation.mutateAsync({
      ...newForm,
      googleFormId: googleFormDetails.formId,
    });
    googlePickerRef.current?.dispose();
  };

  return (
    <div>
      <Script
        src="https://apis.google.com/js/api.js"
        strategy="lazyOnload"
        onLoad={handleGoogleApiLoad}
      />
      <Button
        variant="outline"
        className="cursor-pointer font-semibold font-montserrat"
        onClick={fetchGoogleForms}
        disabled={isAuthenticating}
      >
        {isAuthenticating ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <FileText className="mr-2 size-4" />
        )}
        <span>Import Google Form</span>
      </Button>
    </div>
  );
}
