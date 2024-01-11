import { Workspace } from "@prisma/client";
import { z } from "zod";

import { workspaceUpdateSchema } from "@/lib/validations/workspace";
import { apiClient } from "../fetch";

export const createWorkspaceController = async (
  name: string = "New workspace",
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

export const updateWorkspaceController = async (
  workspaceId: string,
  payload: z.infer<typeof workspaceUpdateSchema>,
) => {
  const response = await apiClient(`workspaces/${workspaceId}`, {
    method: "PUT",
    data: payload,
  });

  return (await response.json()) as Workspace;
};
