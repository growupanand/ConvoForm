import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

type DemoResponsesShellProps = {
  children: ReactNode;
};

export function DemoResponsesShell({ children }: DemoResponsesShellProps) {
  return (
    <div className="bg-white/50 backdrop-blur-md border rounded-2xl shadow-lg p-4 w-full max-w-[600px] min-h-[300px]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-brand-500 size-5" />
        <h3 className="text-lg font-semibold">Live Demo Responses</h3>
      </div>

      {children}
    </div>
  );
}
