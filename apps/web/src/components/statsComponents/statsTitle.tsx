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
    <div className={cn("flex items-center gap-2 text-lg mb-2", className)}>
      {Icon && <Icon className=" h-4 w-4 inline" />}
      <span>{title}</span>
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
    <div className={cn("flex items-center gap-2 text-lg mb-2", className)}>
      {Icon && <Icon className=" h-4 w-4 inline" />}
      <span>{title}</span>
    </div>
  );
}
