"use client";

import { useEffect } from "react";
import { Workspace } from "@prisma/client";
import { useAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

import { workspacesAtom } from "@/lib/atoms/workspaceAtoms";

type Props = {
  children: React.ReactNode;
  workspaces: Workspace[];
  orgId: string;
};

export default function Provider({ children, workspaces, orgId }: Props) {
  useHydrateAtoms([[workspacesAtom, workspaces]]);
  const [, setWorkspaces] = useAtom(workspacesAtom);

  useEffect(() => {
    setWorkspaces(workspaces);
  }, [orgId]);

  return <>{children}</>;
}
