import { LinkN } from "@/components/common/linkN";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export default function BrandName({ className }: Props) {
  return (
    <LinkN href="/">
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
    </LinkN>
  );
}
