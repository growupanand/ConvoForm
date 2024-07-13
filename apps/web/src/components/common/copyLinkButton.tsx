import { Button } from "@convoform/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@convoform/ui/components/ui/tooltip";
import { Copy } from "lucide-react";

export const CopyLinkButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClick}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="end">
        <p>Copy link</p>
      </TooltipContent>
    </Tooltip>
  );
};
