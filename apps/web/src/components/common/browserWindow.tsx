import { Button } from "@convoform/ui/components/ui/button";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { ExternalLink, RotateCw } from "lucide-react";
import Link from "next/link";

import { copyLinkToClipboard } from "@/lib/url";
import { CopyLinkButton } from "./copyLinkButton";

type Props = {
  children: React.ReactNode;
  actionsButton?: React.ReactNode;
  link?: string;
  onRefresh?: () => void;
  toolbar?: React.ReactNode;
  backgroundColor?: string;
  fontColor?: string;
};

const BrowserWindow = ({
  children,
  actionsButton,
  link,
  onRefresh,
  toolbar,
  backgroundColor,
  fontColor,
}: Props) => {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-lg border border-gray-200 shadow-xl shadow-gray-100 ">
      <div className="flex items-center justify-between bg-gray-200 px-3 py-1">
        <WindowButtons />
        <AddressBar link={link} />
        <ActionButtons
          link={link}
          actionsButton={actionsButton}
          onRefresh={onRefresh}
        />
      </div>
      {toolbar && (
        <div className="bg-muted flex w-full justify-start gap-2 p-3">
          {toolbar}
        </div>
      )}
      <div
        className="grow overflow-auto "
        style={{ background: backgroundColor, color: fontColor }}
      >
        {children}
      </div>
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
  const handleCopyLinkToClipboard = () => {
    if (!link) return;
    copyLinkToClipboard(link);
    toast({
      description: "Link copied to clipboard",
    });
  };

  return (
    <div className="flex items-center gap-2 ">
      {actionsButton}
      {link && <CopyLinkButton onClick={handleCopyLinkToClipboard} />}
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

export const AddressBar = ({ link }: { link?: string }) => (
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
    <span className="h-3 w-3 rounded-full bg-red-400" />
    <span className="h-3 w-3 rounded-full bg-yellow-400" />
    <span className="h-3 w-3 rounded-full bg-green-400" />
  </div>
);

export default BrowserWindow;
