"use client";

import { cn } from "@/lib/utils";

type FormEditPageLayoutProps = {
  children: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  leftSidebarWidthClassName?: string;
  rightSidebarWidthClassName?: string;
  className?: HTMLElement["className"];
};

export function FormEditPageLayout({
  children,
  leftSidebar,
  rightSidebar,
  leftSidebarWidthClassName = "w-[450px] min-w-[450px] max-w-[450px] overflow-hidden",
  rightSidebarWidthClassName = "w-[300px] min-w-[300px] max-w-[300px] overflow-hidden",
  className,
}: FormEditPageLayoutProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-stretch space-x-4 px-6",
        className,
      )}
    >
      {/* Left sidebar */}
      {leftSidebar && (
        <div
          className={cn("relative overflow-auto ", leftSidebarWidthClassName)}
        >
          {leftSidebar}
        </div>
      )}

      {/* Main content */}
      <div
        className={cn(
          "grow relative overflow-auto",
          !leftSidebar && !rightSidebar && " mx-auto",
          leftSidebar && rightSidebar && " ms-0",
        )}
      >
        {children}
      </div>

      {/* Right sidebar */}
      {rightSidebar && (
        <div className={cn("relative", rightSidebarWidthClassName)}>
          {rightSidebar}
        </div>
      )}
    </div>
  );
}
