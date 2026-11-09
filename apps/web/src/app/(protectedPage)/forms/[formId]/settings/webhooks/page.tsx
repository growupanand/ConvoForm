import { Webhook } from "lucide-react";
import type { Metadata } from "next";
import WebhookEndpointsSettings from "./_components/webhookEndpointsSettings";

export const metadata: Metadata = {
  title: "Webhooks",
};

type Props = {
  params: Promise<{ formId: string }>;
};

export default async function WebhooksSettingsPage(props: Props) {
  const params = await props.params;
  const { formId } = params;

  return (
    <div>
      <h2 className="mb-5 font-medium capitalize text-2xl">
        <Webhook className="mr-2 inline size-6 text-violet-600" />
        <span>Webhooks</span>
      </h2>
      <WebhookEndpointsSettings formId={formId} />
    </div>
  );
}
