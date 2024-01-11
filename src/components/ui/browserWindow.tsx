import Link from "next/link";
import { ExternalLink, RotateCw } from "lucide-react";

import { CopyLinkButton } from "../copyLinkButton";
import { Button } from "./button";
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
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-lg border border-gray-200 shadow-md ">
      <div className="flex items-center justify-between bg-gray-200 px-3 py-1 max-lg:hidden">
        <WindowButtons />
        <AddressBar link={link} />
        <ActionButtons
          link={link}
          actionsButton={actionsButton}
          onRefresh={onRefresh}
        />
      </div>
      <div className="flex items-center justify-between gap-3 bg-gray-200 px-3 py-1 lg:hidden">
        <div className="self-stretch overflow-hidden">
          <AddressBar link={link} />
        </div>
        <ActionButtons
          link={link}
          actionsButton={actionsButton}
          onRefresh={onRefresh}
        />
      </div>
      <div className="flex w-full justify-start gap-2 bg-muted p-3">
        {toolbar}
      </div>
      <div className="grow overflow-scroll bg-white ">{children}</div>
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
      <div className="flex w-full items-center gap-1 rounded-lg bg-gray-100">
        <Link href={link} target="_blank">
          <Button variant="link" size="sm">
            <span className="overflow-hidden">{link}</span>
            <ExternalLink className="ms-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    )}
  </div>
);

const WindowButtons = () => (
  <div className="flex gap-2">
    <span className="h-3 w-3 rounded-full bg-red-400"></span>
    <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
    <span className="h-3 w-3 rounded-full bg-green-400"></span>
  </div>
);

export default BrowserWindow;
