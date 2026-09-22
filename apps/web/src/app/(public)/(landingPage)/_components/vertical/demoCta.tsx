import { Button } from "@convoform/ui";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function DemoCtaButton({
  children = "Book a demo",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      size="lg"
      className={`rounded-full py-3 lg:py-5 text-base font-montserrat shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px] ${className ?? ""}`}
      asChild
    >
      <Link href="/view/demo" rel="noreferrer nofollow noopener">
        {children}
        <ArrowRight className="size-4 ms-2" />
      </Link>
    </Button>
  );
}
