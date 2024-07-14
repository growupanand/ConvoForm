import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@convoform/ui/components/ui/card";

import { cn } from "@/lib/utils";

export function CardShell({
  children,
  title,
  secondaryText,
  cardHeaderClassName,
}: Readonly<{
  children: React.ReactNode;
  title?: string;
  secondaryText?: string;
  cardHeaderClassName?: string;
}>) {
  const showCardHeader = title || secondaryText;

  return (
    <Card>
      {showCardHeader && (
        <CardHeader className={cn("space-y-0 pb-3", cardHeaderClassName)}>
          {title && (
            <CardTitle className="text-base font-medium lg:text-xl">
              {title}
            </CardTitle>
          )}
          {secondaryText && (
            <p className="text-muted-foreground text-sm font-normal">
              {secondaryText}
            </p>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(!title && "p-6")}>{children}</CardContent>
    </Card>
  );
}
