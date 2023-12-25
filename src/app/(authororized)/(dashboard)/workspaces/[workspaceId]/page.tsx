import FormList from "@/components/formList";
import { WorkspaceHeader } from "@/components/workspaceHeader";

export default async function WorkspacePage() {
  return (
    <div>
      <WorkspaceHeader />
      <FormList />
    </div>
  );
}
