"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/fetch";
import { Workspace } from "@prisma/client";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
  onWorkspaceCreate: (workspace: Workspace) => void;
};

type State = {
  isLoading: boolean;
};

export default function CreateWorkspaceButton({ onWorkspaceCreate }: Props) {
  const [state, setState] = useState<State>({ isLoading: false });
  const { isLoading } = state;

  const createNewWorkspace = async () => {
    setState({ isLoading: true });
    try {
      const response = await apiClient("workspaces", {
        method: "POST",
        data: { name: "New workspace" },
      });
      const workspace = await response.json();
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
      onWorkspaceCreate(workspace);
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
