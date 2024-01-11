import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  label?: string;
};

export function Spinner({ className, label }: Readonly<Props>) {
  return (
    <div className="flex items-center justify-start gap-2">
      <Loader2 className={cn("h-4 w-4 animate-spin ", className)} />
      {label && <span>{label}</span>}
    </div>
  );
}

export default Spinner;
