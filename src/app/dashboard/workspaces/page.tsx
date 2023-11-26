import CreateWorkspaceButton from "@/components/dashboard/workspaces/createWorkspaceButton";

export default function WorkspacesPage() {
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-xl">Workspaces</h1>
        <CreateWorkspaceButton />
      </div>
    </div>
  );
}
