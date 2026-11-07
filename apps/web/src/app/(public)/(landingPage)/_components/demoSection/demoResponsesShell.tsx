import { Card, CardContent, CardHeader } from "@convoform/ui";
import { Inbox } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type DemoResponsesShellProps = {
  children: ReactNode;
};

export function DemoResponsesShell({ children }: DemoResponsesShellProps) {
  return (
    <Card
      noShadow
      className="flex h-full w-full flex-col overflow-hidden rounded-[20px] border-[1.25px] border-marketing-hair bg-marketing-surface"
    >
      <CardHeader className="space-y-1 border-b border-marketing-hair-soft px-5 py-4">
        <div className="flex items-center gap-2">
          <Inbox
            className="size-5 text-marketing-label"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <h3 className="font-display text-[20px] font-semibold leading-[1.2] tracking-[-0.01em] text-marketing-ink">
            Live Form Responses
          </h3>
        </div>
        <div className="font-body text-[14px] leading-[1.5] text-marketing-text">
          <span className="me-2">From:</span>
          <Link
            href="/view/demo"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="rounded-sm font-semibold text-marketing-blue-600 underline decoration-marketing-blue-200 underline-offset-4 transition-colors duration-150 hover:text-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600"
          >
            Sample Survey
          </Link>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 p-0">{children}</CardContent>
    </Card>
  );
}
