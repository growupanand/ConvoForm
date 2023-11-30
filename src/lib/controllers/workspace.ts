import { Workspace } from "@prisma/client";
import { apiClient } from "../fetch";

export const createWorkspaceController = async (
  name: string = "New workspace"
) => {
  const response = await apiClient("workspaces", {
    method: "POST",
    data: { name },
  });

  return (await response.json()) as Workspace;
};

export const deleteWorkspaceController = (workspaceId: string) => {
  return apiClient(`workspaces/${workspaceId}`, {
    method: "DELETE",
  });
};

export const fetchWorkspacesController = async () => {
  const response = await apiClient("workspaces", { method: "GET" });
  return (await response.json()) as Workspace[];
};
