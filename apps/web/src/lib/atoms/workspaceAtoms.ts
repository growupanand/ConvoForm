import { Workspace } from "@prisma/client";
import { atom } from "jotai";

export const workspaceAtom = atom<Workspace | null>(null);
export const isLoadingWorkspaceAtom = atom(true);

export const workspacesAtom = atom<Workspace[]>([]);
export const isLoadingWorkspacesAtom = atom(true);
