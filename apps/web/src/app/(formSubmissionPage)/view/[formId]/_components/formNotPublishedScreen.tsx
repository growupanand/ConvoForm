import { cn } from "@/lib/utils";
import { PenOff } from "lucide-react";

export function FormNotPublishedScreen() {
  return (
    <div className="w-screen h-screen flex items-center justify-center p-10">
      <div
        className={cn(
          "flex items-start gap-4 justify-center",
          "max-lg:flex-col max-lg:items-center max-lg:gap-10",
        )}
      >
        <div>
          <PenOff className="size-14" />
        </div>
        <div className="max-lg:items-center max-lg:flex max-lg:flex-col max-lg:justify-center max-lg:gap-2">
          <h1 className="text-3xl font-semibold">Not available</h1>
          <p className="text-gray-500 text-2xl text-center">
            This form has been closed or not published yet.
          </p>
        </div>
      </div>
    </div>
  );
}
