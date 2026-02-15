import { Button } from "@convoform/ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import FormIntegrationsSettings from "./_components/formIntegrationsSettings";

type Props = {
  params: Promise<{ formId: string }>;
};

export default async function IntegrationsPage(props: Props) {
  const params = await props.params;
  const { formId } = params;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/forms/${formId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Integrations</h1>
      </div>
      <FormIntegrationsSettings formId={formId} />
    </div>
  );
}
