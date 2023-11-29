"use client";

import { Button } from "@/components/ui/button";
import { Workspace } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
  onWorkspaceCreate: (workspace: Workspace) => void;
};

type State = {
  isLoading: boolean;
};

export default function CreateWorkspaceButton({ onWorkspaceCreate }: Props) {
  const [state, setState] = useState<State>({ isLoading: false });
  const { isLoading } = state;

  return (
    <Button disabled={isLoading}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      New workspace
    </Button>
  );
}
