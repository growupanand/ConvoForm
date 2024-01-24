import { montserrat } from "@/app/fonts";
import { LinkN } from "@/components/linkN";
import { brandName } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export default function BrandName({ className = "" }: Props) {
  return (
    <LinkN href="/">
      <span
        className={cn(
          "font-semibold text-foreground",
          className,
          montserrat.className,
        )}
      >
        {brandName}
      </span>
    </LinkN>
  );
}
