import { MessageSquare } from "lucide-react";
import ChannelConnectionsSettings from "../../channels/_components/channelConnectionsSettings";

type Props = {
  params: Promise<{ formId: string }>;
};

export default async function ChannelsSettingsPage(props: Props) {
  const params = await props.params;
  const { formId } = params;

  return (
    <div>
      <h2 className="mb-5 font-medium capitalize text-2xl ">
        <MessageSquare className="h-6 w-6 text-blue-600 inline mr-2" />
        <span>Channels</span>
      </h2>
      <ChannelConnectionsSettings formId={formId} />
    </div>
  );
}
