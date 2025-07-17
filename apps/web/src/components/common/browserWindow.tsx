"use client";

import { Button, Card } from "@convoform/ui";
import { toast } from "@convoform/ui";
import { ExternalLink, RotateCw } from "lucide-react";
import Link from "next/link";

import { copyLinkToClipboard } from "@/lib/url";
import { cn } from "@/lib/utils";
import { CopyLinkButton } from "./copyLinkButton";

type Props = {
  children: React.ReactNode;
  actionsButton?: React.ReactNode;
  link?: string;
  onRefresh?: () => void;
  toolbar?: React.ReactNode;
  backgroundColor?: string;
  fontColor?: string;
  hideCopyButton?: boolean;
  className?: string;
};

const BrowserWindow = ({
  children,
  actionsButton,
  link,
  onRefresh,
  toolbar,
  backgroundColor,
  fontColor,
  hideCopyButton,
  className,
}: Props) => {
  return (
    <Card
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden ",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-x-2 bg-muted px-3 py-2 border-b">
        <WindowButtons />
        <AddressBar link={link} />
        <ActionButtons
          link={link}
          actionsButton={actionsButton}
          onRefresh={onRefresh}
          hideCopyButton={hideCopyButton}
        />
      </div>
      {toolbar && (
        <div className="bg-muted flex w-full justify-start gap-2 p-3">
          {toolbar}
        </div>
      )}
      <div
        className="grow overflow-auto transition-all relative"
        style={{ background: backgroundColor, color: fontColor }}
      >
        {children}
      </div>
    </Card>
  );
};

const ActionButtons = ({
  link,
  actionsButton,
  onRefresh,
  hideCopyButton = false,
}: {
  link?: string;
  actionsButton?: React.ReactNode;
  onRefresh?: () => void;
  hideCopyButton?: boolean;
}) => {
  const handleCopyLinkToClipboard = () => {
    if (!link) return;
    copyLinkToClipboard(link);
    toast.info("Link copied to clipboard");
  };

  return (
    <div className="flex items-center gap-2 ">
      {actionsButton}
      {!hideCopyButton && link && (
        <CopyLinkButton onClick={handleCopyLinkToClipboard} />
      )}
      {onRefresh && (
        <Button variant="ghost" size="xs" onClick={onRefresh}>
          <RotateCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export const AddressBar = ({ link }: { link?: string }) => (
  <div>
    {link && (
      <div className="flex w-full items-center gap-1 rounded-lg bg-emphasis">
        <Link href={link} target="_blank">
          <Button variant="link" size="xs" className="px-4">
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
