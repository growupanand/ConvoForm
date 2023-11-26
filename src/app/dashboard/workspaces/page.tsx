"use client";

import CreateWorkspaceButton from "@/components/dashboard/workspaces/createWorkspaceButton";
import WorkspacesList from "@/components/dashboard/workspaces/workspaceList";
import { Workspace } from "@prisma/client";
import { useEffect, useState } from "react";

type State = {
  isLoading: boolean;
  workspaces: Workspace[];
};

export default function WorkspacesPage() {
  const [state, setState] = useState<State>({
    isLoading: true,
    workspaces: [],
  });
  const { isLoading, workspaces } = state;

  const fetchWorkspaces = async () => {
    setState((cs) => ({ ...cs, isLoading: true, workspaces: [] }));
    try {
      const res = await fetch("/api/workspaces");
      const workspaces = await res.json();
      setState((cs) => ({ ...cs, workspaces }));
    } catch (err) {
      console.error(err);
    } finally {
      setState((cs) => ({ ...cs, isLoading: false }));
    }
  };

  const onWorkspaceDelete = (workspace: Workspace) => {
    setState((cs) => ({
      ...cs,
      workspaces: cs.workspaces.filter((w) => w.id !== workspace.id),
    }));
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl">Workspaces</h1>
        <CreateWorkspaceButton onWorkspaceCreate={fetchWorkspaces} />
      </div>
      <WorkspacesList
        workspaces={workspaces}
        isLoading={isLoading}
        onWorkspaceDelete={onWorkspaceDelete}
      />
    </div>
  );
}
