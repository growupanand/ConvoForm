import { cn } from "@/lib/utils";
import { Button } from "@convoform/ui";
import { Label } from "@convoform/ui";
import { Switch } from "@convoform/ui";

type SwitchProps = Parameters<typeof Switch>[0];

export function ToggleButton({
  label,
  id,
  labelSide = "left",
  noHorizontalPadding,
  description,
  labelClass,
  icon,
  ...switchProps
}: Readonly<
  {
    label: string;
    id: string;
    labelSide?: "left" | "right";
    noHorizontalPadding?: boolean;
    description?: string;
    labelClass?: string;
    icon?: React.ReactNode;
  } & SwitchProps
>) {
  const leftSide = labelSide === "left";
  return (
    <Label htmlFor={id}>
      <Button
        size="lg"
        variant="ghost"
        className={cn(
          "flex gap-2 w-full py-2 h-auto justify-between  cursor-pointer ",
          !leftSide ? "justify-end flex-row-reverse" : undefined,
          noHorizontalPadding ? "px-0 " : "px-4 ",
          description ? "items-start" : "items-center",
        )}
        asChild
      >
        <div>
          <div className="grid space-y-2">
            <span className={cn("flex items-center gap-2", labelClass)}>
              {icon && icon}
              {label}
            </span>
            {description && (
              <span className="text-muted-foreground text-sm font-normal text-wrap">
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
