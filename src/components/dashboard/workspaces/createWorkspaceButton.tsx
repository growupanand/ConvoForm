"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/fetch";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

type State = {
  isLoading: boolean;
};

export default function CreateWorkspaceButton() {
  const [state, setState] = useState<State>({ isLoading: false });
  const { isLoading } = state;

  const createNewWorkspace = async () => {
    setState({ isLoading: true });
    try {
      await apiClient("/api/workspaces", {
        method: "POST",
        data: { name: "New workspace" },
      });
      toast({
        action: (
          <div className="w-full">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-1">
                <Check className="text-white " />
              </div>
              <span>Workspace created</span>
            </div>
          </div>
        ),
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: "Unable to create workspace",
        duration: 1500,
      });
    } finally {
      setState({ isLoading: false });
    }
  };

  return (
    <Button disabled={isLoading} onClick={createNewWorkspace}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      New workspace
    </Button>
  );
}
