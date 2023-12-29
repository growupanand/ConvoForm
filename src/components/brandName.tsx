import { brandName } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Props = {
  className?: string;
};

export default function BrandName({ className = "" }: Props) {
  return (
    <Link href="/">
      <span
        className={cn(
          "font-bold  text-muted-foreground hover:text-foreground",
          className
        )}
      >
        {brandName}
      </span>
    </Link>
  );
}
