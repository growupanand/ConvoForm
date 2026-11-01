import { cn } from "@/lib/utils";
import Link from "next/link";

type Props = {
  className?: string;
};

export default function BrandNameLink({ className }: Props) {
  return (
    <Link href="/">
      <span
        className={cn("font-display text-foreground font-semibold", className)}
      >
        <span className="flex items-center justify-start gap-0">
          <span className="text-brand-600">Convo</span>
          <span>Form</span>
        </span>
      </span>
    </Link>
  );
}
