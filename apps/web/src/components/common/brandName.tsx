import { cn } from "@/lib/utils";
import Link from "next/link";

type Props = {
  className?: string;
};

export default function BrandNameLink({ className }: Props) {
  return (
    <Link href="/">
      <span
        className={cn(
          "text-foreground font-semibold font-montserrat",
          className,
        )}
      >
        <span className="flex items-center justify-start gap-0">
          <span className="text-brand-500">Convo</span>
          <span>Form</span>
        </span>
      </span>
    </Link>
  );
}
