"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

export const getWorkspaces = async (organizationId: string) => {
  return prisma.workspace.findMany({
    where: {
      organizationId: organizationId,
    },
  });
};

export const getWorkspace = cache(
  async (workspaceId: string, organizationId: string) => {
    return prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        organizationId,
      },
    });
  },
);

export const createWorkspace = async (
  workspaceName: string,
  userId: string,
  organizationId: string,
) => {
  return await prisma.workspace.create({
    data: {
      name: workspaceName,
      userId,
      organizationId,
    },
  });
};

export const deleteWorkspace = async (
  workspaceId: string,
  organizationId: string,
) => {
  revalidatePath("/dashboard", "page");
  return await prisma.workspace.delete({
    where: {
      id: workspaceId,
      organizationId,
    },
  });
};

export const updateWorkspace = async (
  workspaceId: string,
  organizationId: string,
  workspaceName: string,
) => {
  revalidatePath("/workspaces/[workspaceId]", "page");
  return await prisma.workspace.update({
    where: {
      id: workspaceId,
      organizationId,
    },
    data: {
      name: workspaceName,
    },
  });
};
