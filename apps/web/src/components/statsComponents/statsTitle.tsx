"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@convoform/ui";
import type { LucideIcon } from "lucide-react";

type StatsTitleProps = {
  title: string;
  icon?: LucideIcon;
  badge?: string;
  className?: string;
  children?: React.ReactNode;
};

export function StatsTitle({
  title,
  icon: Icon,
  badge,
  className,
  children,
}: StatsTitleProps) {
  return (
    <div className={cn("flex items-center gap-2 text-lg mb-4", className)}>
      <span className="text-secondary-foreground">
        {Icon && <Icon className="mr-2 h-4 w-4 inline" />}
        {title}
      </span>
      {badge && <Badge variant="secondary">{badge}</Badge>}
      {children}
    </div>
  );
}

export function StatsTitleSkeleton({
  title,
  icon: Icon,
  className,
}: Pick<StatsTitleProps, "title" | "icon" | "className">) {
  return (
    <div className={cn("flex items-center gap-2 text-lg mb-4", className)}>
      <span className="text-muted-foreground">
        {Icon && <Icon className="mr-2 h-4 w-4 inline" />}
        {title}
      </span>
    </div>
  );
}
