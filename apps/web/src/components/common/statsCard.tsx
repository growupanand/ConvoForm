import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@convoform/ui";
import { Skeleton } from "@convoform/ui";

export type StatsCardProps = {
  title: string;
  primaryValue: string;
  description?: string;
  className?: HTMLDivElement["className"];
  icon?: React.ReactNode;
};

export const StatsCard = ({
  primaryValue,
  title,
  description,
  className,
  icon,
}: StatsCardProps) => {
  return (
    <Card
      className={cn("overflow-hidden bg-muted p-0.5 rounded-xl ", className)}
    >
      <div className="rounded-xl overflow-hidden bg-white border flex flex-col">
        <CardHeader className="py-2 flex-1 flex-row justify-between items-center">
          <CardTitle className="text-sm">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent className="px-4 pb-2 text-xl font-bold ">
          {primaryValue}
        </CardContent>
      </div>
      {description && (
        <CardFooter className="px-4 py-2 text-xs text-muted-foreground bg-muted items-start self-start">
          {description}
        </CardFooter>
      )}
    </Card>
  );
};

StatsCard.displayName = "StatsCard";

StatsCard.Skeleton = () => {
  return (
    <Card className="overflow-hidden bg-muted p-0.5 rounded-xl flex flex-col">
      <div className="rounded-xl overflow-hidden bg-white border grow">
        <CardHeader className=" px-4 py-2 text-sm font-semibold text-muted-foreground">
          <Skeleton className="h-3 w-16" />
        </CardHeader>
        <CardContent className="px-4 py-2 text-3xl font-extrabold">
          <Skeleton className="h-6 w-10" />
        </CardContent>
      </div>
      <CardFooter className="px-4 py-2 text-sm text-muted-foreground bg-muted gap-2">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-12" />
      </CardFooter>
    </Card>
  );
};
