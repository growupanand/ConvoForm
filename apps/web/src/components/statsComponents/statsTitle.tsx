"use client";

import { cn } from "@/lib/utils";
import { Badge, SectionHeading } from "@convoform/ui";
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
    <SectionHeading className={cn("ps-0 text-lg mb-2", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 inline" />}
        {title}
        {badge && <Badge variant="secondary">{badge}</Badge>}
        {children}
      </div>
    </SectionHeading>
  );
}

export function StatsTitleSkeleton({
  title,
  icon: Icon,
  className,
}: Pick<StatsTitleProps, "title" | "icon" | "className">) {
  return (
    <SectionHeading className={cn("ps-0 text-lg mb-2", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 inline" />}
        <span>{title}</span>
      </div>
    </SectionHeading>
  );
}
