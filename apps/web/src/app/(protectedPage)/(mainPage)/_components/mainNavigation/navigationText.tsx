import { Button } from "@convoform/ui/components/ui/button";

import type { NavItemAction } from "@/lib/types/navigation";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  variant?: NavigationTextVariants;
  action?: NavItemAction;
};

export type NavigationTextVariants = "default" | "error" | "success";

const navigationTextVariantsClasses = {
  default: "",
  error: "text-red-500",
  success: "text-green-500",
};

function NavigationText({ text, variant, action }: Readonly<Props>) {
  const NavText = () => (
    <span
      className={cn(
        "text-muted-foreground text-sm font-normal ps-2",
        variant && navigationTextVariantsClasses[variant],
      )}
    >
      {text}
    </span>
  );

  return (
    <div>
      <div className="flex items-center justify-between ">
        {action ? (
          <div className="flex items-center justify-between gap-2">
            <NavText />
            <Button
              size="sm"
              variant="ghost"
              className={cn(variant && navigationTextVariantsClasses[variant])}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          </div>
        ) : (
          <NavText />
        )}
      </div>
    </div>
  );
}

export { NavigationText };
