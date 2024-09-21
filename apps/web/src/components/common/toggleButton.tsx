import { cn } from "@/lib/utils";
import { Button } from "@convoform/ui/components/ui/button";
import { Label } from "@convoform/ui/components/ui/label";
import { Switch } from "@convoform/ui/components/ui/switch";

type SwitchProps = Parameters<typeof Switch>[0];

export function ToggleButton({
  label,
  id,
  labelSide = "left",
  noHorizontalPadding,
  description,
  ...switchProps
}: Readonly<
  {
    label: string;
    id: string;
    labelSide?: "left" | "right";
    noHorizontalPadding?: boolean;
    description?: string;
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
            <span>{label}</span>
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
