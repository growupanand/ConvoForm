import { Zap } from "lucide-react";
import FormIntegrationsSettings from "../integrations/_components/formIntegrationsSettings";

type Props = {
  params: Promise<{ formId: string }>;
};

export default async function SettingsPage(props: Props) {
  const params = await props.params;
  const { formId } = params;

  return (
    <div>
      <h2 className="mb-5 font-medium capitalize text-2xl ">
        <Zap className="h-6 w-6 text-green-600 inline mr-2" />
        <span>Integrations</span>
      </h2>
      <FormIntegrationsSettings formId={formId} />
    </div>
  );
}
