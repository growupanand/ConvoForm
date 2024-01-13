import { Metadata } from "next";

import FormList from "@/components/formList";
import { WorkspaceHeader } from "@/components/workspaceHeader";

export const metadata: Metadata = {
  title: "Workspaces",
};

export default async function WorkspacePage() {
  return (
    <div>
      <WorkspaceHeader />
      <FormList />
    </div>
  );
}
