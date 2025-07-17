import { Button } from "@convoform/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@convoform/ui";
import { Copy } from "lucide-react";

export const CopyLinkButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="xs" onClick={onClick}>
          <Copy className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="end">
        <p>Copy link</p>
      </TooltipContent>
    </Tooltip>
  );
};
