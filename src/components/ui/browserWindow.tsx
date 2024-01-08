import { ExternalLink, RotateCw } from "lucide-react";
import { Button } from "./button";
import { CopyLinkButton } from "../copyLinkButton";
import Link from "next/link";
import { toast } from "./use-toast";

type Props = {
  children: React.ReactNode;
  actionsButton?: React.ReactNode;
  link?: string;
  onRefresh?: () => void;
  toolbar?: React.ReactNode;
};

const BrowserWindow = ({
  children,
  actionsButton,
  link,
  onRefresh,
  toolbar,
}: Props) => {
  return (
    <div className="w-full h-full relative flex flex-col rounded-lg overflow-hidden border border-gray-200 shadow-md ">
      <div className="bg-gray-200 flex justify-between items-center px-3 py-1 max-lg:hidden">
        <WindowButtons />
        <AddressBar link={link} />
        <ActionButtons
          link={link}
          actionsButton={actionsButton}
          onRefresh={onRefresh}
        />
      </div>
      <div className="bg-gray-200 flex justify-between items-center gap-3 px-3 py-1 lg:hidden">
        <div className="self-stretch overflow-hidden">
          <AddressBar link={link} />
        </div>
        <ActionButtons
          link={link}
          actionsButton={actionsButton}
          onRefresh={onRefresh}
        />
      </div>
      <div className="w-full flex justify-start gap-2 p-3 bg-muted">
        {toolbar}
      </div>
      <div className="bg-white grow overflow-scroll ">{children}</div>
    </div>
  );
};

const ActionButtons = ({
  link,
  actionsButton,
  onRefresh,
}: {
  link?: string;
  actionsButton?: React.ReactNode;
  onRefresh?: () => void;
}) => {
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(link ?? "");
    toast({
      title: "Link copied to clipboard",
    });
  };
  return (
    <div className="flex items-center gap-2 ">
      {actionsButton}
      {link && <CopyLinkButton onClick={copyLinkToClipboard} />}
      {onRefresh && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onRefresh}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

const AddressBar = ({ link }: { link?: string }) => (
  <div>
    {link && (
      <div className="bg-gray-100 rounded-lg flex items-center gap-1 w-full">
        <Link href={link} target="_blank">
          <Button variant="link" size="sm">
            <span className="overflow-hidden">{link}</span>
            <ExternalLink className="w-4 h-4 ms-2" />
          </Button>
        </Link>
      </div>
    )}
  </div>
);

const WindowButtons = () => (
  <div className="flex gap-2">
    <span className="w-3 h-3 rounded-full bg-red-400"></span>
    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
    <span className="w-3 h-3 rounded-full bg-green-400"></span>
  </div>
);

export default BrowserWindow;
