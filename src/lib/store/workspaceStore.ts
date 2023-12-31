import { Workspace } from "@prisma/client";
import { create } from "zustand";
import {
  createWorkspaceController,
  deleteWorkspaceController,
  fetchWorkspacesController,
  updateWorkspaceController,
} from "../controllers/workspace";
import { toast } from "@/components/ui/use-toast";
import { workspaceUpdateSchema } from "@/lib/validations/workspace";
import { z } from "zod";

type WorkspaceStore = {
  initializeStore: () => Promise<void>;
  workspaces: Workspace[];
  isLoading: boolean;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  updateWorkspace: (
    workspaceId: string,
    payload: z.infer<typeof workspaceUpdateSchema>
  ) => Promise<Workspace>;
  isBusyInCreatingWorkspace: boolean;
};

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [],
  isLoading: true,
  isBusyInCreatingWorkspace: false,

  initializeStore: async () => {
    await get().fetchWorkspaces();
  },

  fetchWorkspaces: async () => {
    set({ isLoading: true, workspaces: [] });
    const workspaces = await fetchWorkspacesController();
    set({ workspaces, isLoading: false });
  },

  createWorkspace: async (name: string) => {
    set({ isBusyInCreatingWorkspace: true });
    try {
      const workspace = await createWorkspaceController(name);
      set((state) => ({
        workspaces: [...state.workspaces, workspace],
      }));
      return workspace;
    } finally {
      set({ isBusyInCreatingWorkspace: false });
    }
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

  updateWorkspace: async (
    workspaceId: string,
    payload: z.infer<typeof workspaceUpdateSchema>
  ) => {
    const workspace = await updateWorkspaceController(workspaceId, payload);
    set((state) => ({
      workspaces: state.workspaces.map((workspace) =>
        workspace.id === workspaceId ? { ...workspace, ...payload } : workspace
      ),
    }));
    return workspace;
  },
}));
