import { AppNavbarButton } from "@/components/appNavbar/appNavbarButton";
import FormEditor from "@/components/formEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface WorkspacePageProps {
  params: { workspaceId: string };
}

export default function NewFormPage({ params }: WorkspacePageProps) {
  const { workspaceId } = params;

  return (
    <div className="flex h-screen">
      <div className="bg-white-300 w-[400px] bg-gray-50 overflow-auto">
        <Card className="bg-transparent border-0 shadow-none">
          <CardContent className="pt-3">
            <div className="flex justify-between items-center">
              <Link href={`/workspaces/${workspaceId}/`}>
                <Button variant="link">Back</Button>
              </Link>
              <AppNavbarButton />
            </div>
            <FormEditor workspaceId={workspaceId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
