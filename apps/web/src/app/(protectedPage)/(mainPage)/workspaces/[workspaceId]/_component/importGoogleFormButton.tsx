"use client";

import Spinner from "@/components/common/spinner";
import { useGoogleAuth } from "@/contexts/GoogleAuthContext";
import { api } from "@/trpc/react";
import { Button, DialogDescription } from "@convoform/ui";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@convoform/ui";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

import type { GoogleDriveFormMeta } from "@convoform/db/src/schema";

// type Props = {
//   workspace?: Workspace;
// };

export default function ImportGoogleFormButton() {
  const { getAccessToken, isAuthenticating } = useGoogleAuth();
  const [isLoadingForms, setIsLoadingForms] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<GoogleDriveFormMeta | null>(
    null,
  );

  const googleDriveFormsFilesQuery = api.google.getDriveFormsFiles.useMutation({
    meta: {
      allowRetry: true,
    },
  });

  const {
    data: googleDriveFormsFiles,
    isPending: googleDriveFormsFilesPending,
  } = googleDriveFormsFilesQuery;

  const isLoadingGoogleForms = isLoadingForms || googleDriveFormsFilesPending;
  const hasGoogleDriveFormsFiles =
    !isLoadingGoogleForms &&
    googleDriveFormsFiles &&
    googleDriveFormsFiles.length > 0;

  // Fetch Google Forms from user's drive
  const fetchGoogleForms = async () => {
    const googleAccessToken = await getAccessToken();
    setIsLoadingForms(true);
    setIsModalOpen(true);

    await googleDriveFormsFilesQuery.mutateAsync({
      accessToken: googleAccessToken,
    });
  };

  // Handle form import
  const handleImportForm = async (formMeta: GoogleDriveFormMeta) => {
    setSelectedForm(formMeta);
    setIsImporting(true);
    console.log("selected form", formMeta);

    try {
      //   await importPromise;
      await new Promise((resolve) => setTimeout(resolve, 4000));
      setIsModalOpen(false);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="flex-row items-center">
            <DialogTitle>Import Google Form</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Select the form you want to import from your Google Drive
          </DialogDescription>

          {isLoadingGoogleForms && (
            <div className="flex justify-center py-8">
              <Spinner label="Loading your Google Forms" />
            </div>
          )}

          {!isLoadingGoogleForms && !hasGoogleDriveFormsFiles && (
            <div className="py-6 text-center">
              <p>No Google Forms found in your account.</p>
            </div>
          )}

          {!isLoadingGoogleForms && hasGoogleDriveFormsFiles && (
            <div className="max-h-[400px] overflow-y-auto">
              <div className="grid space-y-2">
                {googleDriveFormsFiles.map((form) => {
                  const isImportingCurrentForm =
                    isImporting && form.id === selectedForm?.id;

                  return (
                    <Button
                      key={form.id}
                      variant="ghost"
                      className="h-auto group"
                      onClick={() => handleImportForm(form)}
                      disabled={isImporting}
                    >
                      <div className="w-full flex items-center justify-start gap-2">
                        <FileText className="size-8" />

                        <div className="flex flex-col items-start">
                          <h3 className="font-medium">{form.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Last modified:{" "}
                            {new Date(form.modifiedTime).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="ms-auto">
                          {isImportingCurrentForm ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          ) : (
                            <ExternalFormLink form={form} />
                          )}
                        </span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExternalFormLink({ form }: { form: GoogleDriveFormMeta }) {
  return (
    <a
      href={form.webViewLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()} // Prevent triggering the parent button's onClick
      className="inline-flex items-center justify-center rounded-md p-1.5 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      title="Open Google Form in new tab"
    >
      View <ExternalLink className="ms-2 size-4" />
      <span className="sr-only">View Form</span>
    </a>
  );
}
