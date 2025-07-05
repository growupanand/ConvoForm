import { cn } from "@/lib/utils";
import { Button } from "@convoform/ui";
import { Label } from "@convoform/ui";
import { Switch } from "@convoform/ui";

type SwitchProps = Parameters<typeof Switch>[0];

export function ToggleButton({
  label,
  id,
  description,
  labelClass,
  icon,
  buttonProps,
  className,
  switchProps,
}: Readonly<{
  className?: HTMLElement["className"];
  label: string;
  id: string;
  description?: string;
  labelClass?: string;
  icon?: React.ReactNode;
  switchProps?: SwitchProps;
  buttonProps?: Omit<Parameters<typeof Button>[0], "asChild" | "className">;
}>) {
  return (
    <Label htmlFor={id}>
      <Button
        variant="ghost"
        {...buttonProps}
        className={cn(
          " cursor-pointer text-xl h-auto",

          className,
        )}
        asChild
      >
        <div className="space-x-4 flex !items-start">
          <div className="grid space-y-1">
            <span
              className={cn("flex items-center gap-2 text-base", labelClass)}
            >
              {icon && icon}
              <span>{label}</span>
            </span>
            {description && (
              <span className="text-subtle-foreground text-sm font-normal text-wrap">
                {description}
              </span>
            )}
          </div>
          <Switch {...switchProps} id={id} />
        </div>
      </Button>
    </Label>
  );
}
