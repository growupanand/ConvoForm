import { Workspace } from "@prisma/client";
import { create } from "zustand";
import {
  createWorkspaceController,
  deleteWorkspaceController,
  fetchWorkspacesController,
} from "../controllers/workspace";
import { toast } from "@/components/ui/use-toast";

type WorkspaceStore = {
  initializeStore: () => Promise<void>;
  workspaces: Workspace[];
  isLoading: boolean;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
};

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [],
  isLoading: false,

  initializeStore: async () => {
    await get().fetchWorkspaces();
  },

  fetchWorkspaces: async () => {
    set({ isLoading: true });
    const workspaces = await fetchWorkspacesController();
    set({ workspaces, isLoading: false });
  },

  createWorkspace: async (name: string) => {
    const workspace = await createWorkspaceController(name);
    set((state) => ({ workspaces: [...state.workspaces, workspace] }));
    return workspace;
  },

  deleteWorkspace: async (workspaceId: string) => {
    await deleteWorkspaceController(workspaceId);
    toast({
      title: "Workspace deleted",
      duration: 1500,
    });
    set((state) => ({
      workspaces: state.workspaces.filter(
        (workspace) => workspace.id !== workspaceId
      ),
    }));
  },
}));
