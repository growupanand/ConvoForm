import ConversationsListCard from "@/components/formEditor/conversationsCard";
import { Separator } from "@/components/ui/separator";

type Props = {
  params: { formId: string };
  children: React.ReactNode;
};

export default async function Layout(props: Props) {
  return (
    <div className="flex h-full">
      <div className=" min-w-[400px] w-[400px]">
        <ConversationsListCard />
      </div>
      <Separator orientation="vertical" />
      <div className="grow flex flex-col">{props.children}</div>
    </div>
  );
}
