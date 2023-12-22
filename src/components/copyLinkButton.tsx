import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Copy } from "lucide-react";
import { Button } from "./ui/button";

export const CopyLinkButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <TooltipProvider delayDuration={200}>
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
    </TooltipProvider>
  );
};
