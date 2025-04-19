"use client";

import Spinner from "@/components/common/spinner";
import { useGoogleAuth } from "@/contexts/GoogleAuthContext";
import { Button, DialogDescription } from "@convoform/ui";
import { toast } from "@convoform/ui";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@convoform/ui";
import { FileText, Loader2 } from "lucide-react";
import { useState } from "react";

// type Props = {
//   workspace?: Workspace;
// };

type GoogleForm = {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink: string;
};

export default function ImportGoogleFormButton() {
  const { getAccessToken, isAuthenticating } = useGoogleAuth();
  const [isLoadingForms, setIsLoadingForms] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [googleForms, setGoogleForms] = useState<GoogleForm[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<GoogleForm | null>(null);

  //   const router = useRouter();

  // We'll need to create this TRPC mutation in the API
  //   const importForm = api.form.importGoogleForm.useMutation({
  //     onSuccess: async (newForm) => {
  //       router.push(`/forms/${newForm.id}`);
  //     },
  //     onError: (error) => {
  //       toast({
  //         title: "Failed to import form",
  //         duration: 1500,
  //         variant: "destructive",
  //         description: error.message,
  //       });
  //     },
  //   });

  // Fetch Google Forms from user's drive
  const fetchGoogleForms = async () => {
    try {
      const token = await getAccessToken();

      setIsLoadingForms(true);
      setIsModalOpen(true);
      // Call your API endpoint that will use Google's API to fetch forms
      const response = await fetch("/api/google/forms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API error details:", data);
        throw new Error(
          data.error || data.details || "Failed to fetch Google Forms",
        );
      }

      setGoogleForms(data.forms || []);
    } catch (error) {
      toast.error("Failed to fetch forms", {
        description:
          error instanceof Error
            ? error.message
            : "Could not retrieve your Google Forms",
      });
    } finally {
      setIsLoadingForms(false);
    }
  };

  // Handle form import
  const handleImportForm = async (googleFormId: string) => {
    setSelectedForm({
      id: googleFormId,
      name: "",
      modifiedTime: "",
      webViewLink: "",
    });
    setIsImporting(true);

    // const importPromise = importForm.mutateAsync({
    //   googleFormId,
    //   workspaceId: workspace.id,
    //   organizationId: workspace.organizationId,
    // });

    // toast.promise(importPromise, {
    //   loading: "Importing form...",
    //   success: "Form imported successfully",
    //   error: "Failed to import form",
    // });

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

          {isLoadingForms && (
            <div className="flex justify-center py-8">
              <Spinner label="Loading your Google Forms" />
            </div>
          )}

          {!isLoadingForms && googleForms.length === 0 && (
            <div className="py-6 text-center">
              <p>No Google Forms found in your account.</p>
            </div>
          )}

          {!isLoadingForms && googleForms.length > 0 && (
            <div className="max-h-[400px] overflow-y-auto">
              <div className="grid space-y-2">
                {googleForms.map((form) => (
                  <Button
                    key={form.id}
                    variant="ghost"
                    className="h-auto group"
                    onClick={() => handleImportForm(form.id)}
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
                        {isImporting && form.id === selectedForm?.id && (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
