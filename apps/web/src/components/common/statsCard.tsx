import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@convoform/ui/components/ui/card";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";

type StatsCardProps = {
  title: string;
  primaryValue: string;
  description?: string;
};

export const StatsCard = ({
  primaryValue,
  title,
  description,
}: StatsCardProps) => {
  return (
    <Card className="overflow-hidden bg-muted p-0.5 rounded-xl flex flex-col">
      <div className="rounded-xl overflow-hidden bg-white border grow">
        <CardHeader className=" px-4 py-2 text-sm font-semibold text-muted-foreground">
          {title}
        </CardHeader>
        <CardContent className="px-4 py-2 text-3xl font-extrabold ">
          {primaryValue}
        </CardContent>
      </div>
      {description && (
        <CardFooter className="px-4 py-2 text-sm text-muted-foreground bg-muted">
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
