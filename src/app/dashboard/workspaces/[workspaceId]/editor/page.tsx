import FormEditor from "@/components/formEditor";
import { Button } from "@/components/ui/button";

import Link from "next/link";

interface WorkspacePageProps {
  params: { workspaceId: string };
}

export default function NewFormPage({ params }: WorkspacePageProps) {
  const { workspaceId } = params;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <Link href={`/dashboard/workspaces/${workspaceId}`}>
          <Button variant="ghost">Back</Button>
        </Link>
      </div>
      <div className="lg:grid grid-cols-12">
        <div className="col-span-4">
          <FormEditor workspaceId={workspaceId} />
        </div>
      </div>
    </div>
  );
}
