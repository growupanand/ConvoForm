import { Button, Card, CardContent, CardHeader } from "@convoform/ui";
import { Inbox } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type DemoResponsesShellProps = {
  children: ReactNode;
};

export function DemoResponsesShell({ children }: DemoResponsesShellProps) {
  return (
    <Card className="w-full max-w-[600px] min-h-[300px]">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 text-brand-600">
          <Inbox className="size-6" />
          <h3 className="font-semibold text-lg">Live Form Responses</h3>
        </div>
        <div className=" text-sm text-muted-foreground">
          <span className="me-2">From:</span>
          <Button variant="link" className="p-0 h-auto " asChild>
            <Link
              href="/view/demo"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              Sample Survey
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
