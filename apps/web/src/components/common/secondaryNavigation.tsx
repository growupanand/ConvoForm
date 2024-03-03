"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@convoform/ui/components/ui/button";
import { motion, stagger, useAnimate } from "framer-motion";

import { cn } from "@/lib/utils";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string | React.ReactNode;
  }[];
  heading?: string;
  enableStaggerListAnimation?: boolean;
}

export function SecondaryNavigation({
  className,
  items,
  heading,
  enableStaggerListAnimation,
  ...props
}: Readonly<SidebarNavProps>) {
  const [scope, animate] = useAnimate();
  const pathname = usePathname();

  const loadListItems = () => {
    animate(
      ".slide-down-list-item",
      { opacity: 1, translate: 0 },
      { delay: stagger(0.1), duration: 0.2 },
    );
  };

  useEffect(() => {
    if (enableStaggerListAnimation) {
      loadListItems();
    }
  }, [enableStaggerListAnimation]);

  return (
    <div ref={scope}>
      {heading && (
        <h3 className="mb-5 px-4 text-lg font-medium tracking-tight ">
          {heading}
        </h3>
      )}
      <nav className={cn("flex flex-col gap-1", className)} {...props}>
        {items.map((item) => (
          <motion.div
            className="slide-down-list-item"
            key={item.href}
            initial={
              enableStaggerListAnimation
                ? { opacity: 0, translate: "0 -0.5rem" }
                : undefined
            }
          >
            <Link href={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  " w-full justify-start font-normal",
                  pathname === item.href && "font-medium",
                )}
              >
                {item.title}
              </Button>
            </Link>
          </motion.div>
        ))}
      </nav>
    </div>
  );
}
