"use client";

import Spinner from "@/components/common/spinner";
import { api } from "@/trpc/react";
import { toast } from "@convoform/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react"; // Added useRef

export default function IntegrationCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const called = useRef(false); // Ref to track if mutation has been called

  const callbackMutation = api.integration.callback.useMutation({
    onSuccess: () => {
      toast.success("Successfully connected!");
      router.push("/settings/integrations");
    },
    onError: (error) => {
      toast.error(`Connection failed: ${error.message}`);
      router.push("/settings/integrations");
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(`Provider error: ${error}`);
      router.push("/settings/integrations");
      return;
    }

    if (code && !called.current) {
      called.current = true; // Mark as called
      callbackMutation.mutate({
        provider: "google_sheets", // Assuming logic to determine provider or default for now.
        // Ideally state param should carry provider info, but for now we only have google sheets.
        code,
      });
    }
  }, [code, error, router, callbackMutation]); // callbackMutation is stable

  return (
    <div className="h-screen w-full flex items-center justify-center flex-col gap-4">
      <Spinner size="lg" />
      <p className="text-muted-foreground">Connecting integration...</p>
    </div>
  );
}
