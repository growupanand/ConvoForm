"use client";

import { useEffect } from "react";
import { Form, Workspace } from "@prisma/client";
import { useAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

import { currentFormAtom } from "@/lib/atoms/formAtoms";
import { workspaceAtom } from "@/lib/atoms/workspaceAtoms";

type Props = {
  children: React.ReactNode;
  form: Form;
  workspace: Workspace;
};

export default function Provider({ children, form, workspace }: Props) {
  useHydrateAtoms([[currentFormAtom, form]]);
  useHydrateAtoms([[workspaceAtom, workspace]]);

  const [, setForm] = useAtom(currentFormAtom);
  const [, setWorkspace] = useAtom(workspaceAtom);

  useEffect(() => {
    setForm(form);
    setWorkspace(workspace);
  }, [form, workspace]);

  return <>{children}</>;
}
