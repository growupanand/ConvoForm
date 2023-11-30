import { Check, Loader2, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { Workspace } from "@prisma/client";
import { useState } from "react";
import { toast } from "../ui/use-toast";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";

type Props = {
  workspace: Workspace;
};

type State = {
  isDeleting: boolean;
};

export const DeleteWorkspaceButton = ({ workspace }: Props) => {
  const [state, setState] = useState<State>({
    isDeleting: false,
  });
  const { isDeleting } = state;

  const workspaceStore = useWorkspaceStore();

  const deleteWorkspace = async () => {
    setState((cs) => ({ ...cs, isDeleting: true }));
    try {
      await workspaceStore.deleteWorkspace(workspace.id);
      toast({
        action: (
          <div className="w-full">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-1">
                <Check className="text-white " />
              </div>
              <span>Workspace deleted</span>
            </div>
          </div>
        ),
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: "Unable to delete workspace",
        duration: 1500,
        action: (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={isDeleting}
            onClick={deleteWorkspace}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Retry"
            )}
          </Button>
        ),
      });
    } finally {
      setState((cs) => ({ ...cs, isDeleting: false }));
    }
  };
  return (
    <Button
      variant="link"
      className="text-gray-500 hover:text-gray-800 hover:text-destructive"
      onClick={deleteWorkspace}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className=" h-4 w-4 animate-spin" />
      ) : (
        <Trash className="w-4 h-4" />
      )}
    </Button>
  );
};
