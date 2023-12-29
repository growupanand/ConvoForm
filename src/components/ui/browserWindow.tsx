import { Globe, RotateCw } from "lucide-react";
import { Button } from "./button";

type Props = {
  children: React.ReactNode;
  actionsButton?: React.ReactNode;
  addressBar?: React.ReactNode;
  onRefresh?: () => void;
  toolbar?: React.ReactNode;
};

const BrowserWindow = ({
  children,
  actionsButton,
  addressBar,
  onRefresh,
  toolbar,
}: Props) => {
  return (
    <div className="w-full h-full relative flex flex-col rounded-lg overflow-hidden border border-gray-200 shadow-md ">
      <div className="w-full h-11  bg-gray-200 flex justify-between items-center space-x-1.5 px-3">
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-red-400"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
          <span className="w-3 h-3 rounded-full bg-green-400"></span>
        </div>
        <div className="bg-gray-100 px-3 rounded-lg flex items-center gap-1">
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
          {addressBar}
        </div>
        <div>{actionsButton}</div>
      </div>
      <div className="w-full flex justify-start gap-2 p-3 bg-muted">
        {toolbar}
      </div>
      <div className="bg-white grow overflow-scroll ">{children}</div>
    </div>
  );
};

export default BrowserWindow;
