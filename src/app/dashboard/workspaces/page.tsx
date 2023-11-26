import CreateWorkspaceButton from "@/components/dashboard/workspaces/createWorkspaceButton";
import WorkspacesList from "@/components/dashboard/workspaces/workspaceList";

export default function WorkspacesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl">Workspaces</h1>
        <CreateWorkspaceButton />
      </div>
      <WorkspacesList />
    </div>
  );
}
