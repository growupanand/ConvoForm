"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Workspace } from "@prisma/client";

import { getWorkspaces } from "@/lib/serverActions/workspace";

type WorkspacesContextType = {
  workspaces: Workspace[];
  updateWorkspace: (workspace: Workspace) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  isLoading: boolean;
};

export const WorkspacesContext = createContext<
  WorkspacesContextType | undefined
>(undefined);

type State = {
  workspaces: Workspace[];
  isLoading: boolean;
};

export default function WorkspacesProvider({
  children,
  orgId,
}: Readonly<{
  children: React.ReactNode;
  orgId: string;
}>) {
  const [state, setState] = useState<State>({
    workspaces: [],
    isLoading: true,
  });
  const { workspaces, isLoading } = state;

  const setWorkspaces = useCallback((workspaces: Workspace[]) => {
    setState((cs) => ({ ...cs, workspaces: [...workspaces] }));
  }, []);

  const updateWorkspace = useCallback((workspace: Workspace) => {
    setState((cs) => ({
      ...cs,
      workspaces: cs.workspaces.map((w) =>
        w.id === workspace.id ? workspace : w,
      ),
    }));
  }, []);

  const value = useMemo(
    () => ({
      workspaces,
      updateWorkspace,
      setWorkspaces,
      isLoading,
    }),
    [workspaces, updateWorkspace, setWorkspaces, isLoading],
  );

  useEffect(() => {
    if (orgId) {
      (async () => {
        setState((cs) => ({ ...cs, isLoading: true }));
        const workspaces = await getWorkspaces(orgId);
        setWorkspaces(workspaces);
        setState((cs) => ({ ...cs, isLoading: false }));
      })();
    }
  }, [orgId]);

  return (
    <WorkspacesContext.Provider value={value}>
      {children}
    </WorkspacesContext.Provider>
  );
}

export const useWorkspacesContext = (): WorkspacesContextType => {
  const context = useContext(WorkspacesContext);
  if (!context) {
    throw new Error(
      "useWorkspacesContext must be used within a WorkspacesProvider",
    );
  }
  return context;
};
