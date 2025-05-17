import { Card, CardContent, CardHeader } from "@convoform/ui";
import { ClipboardList } from "lucide-react";
import type { ReactNode } from "react";

type DemoResponsesShellProps = {
  children: ReactNode;
};

export function DemoResponsesShell({ children }: DemoResponsesShellProps) {
  return (
    <Card className="w-full max-w-[600px] min-h-[300px]">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <ClipboardList className=" size-5" />
        <h3 className="text-lg font-semibold ">Realtime Submissions</h3>
        <span className="ms-auto text-muted-foreground ">Demo Form</span>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
