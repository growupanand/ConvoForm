"use client";

import Link from "next/link";
import NProgress from "nprogress";
import { type PropsWithChildren, useEffect } from "react";

import { cn } from "@/lib/utils";

/**
 * Currently, In Next.js app router there is no way to listen to route change events,
 * so i found only this solution here - https://github.com/vercel/next.js/discussions/41934#discussioncomment-7195052
 *
 */

// TODO: Use router events when it will be available in Next.js app router

/**
 * Do not use this where link will remain on the same page, It will work only where link component will dismount
 * @param param0
 * @returns
 */
export const LinkN: React.FC<
  PropsWithChildren<{
    href: string;
    target?: string;
    rel?: string;
    className?: string;
  }>
> = ({ href, children, className, target, rel }) => {
  NProgress.configure({ showSpinner: false });

  useEffect(() => {
    return () => {
      NProgress.done();
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (shouldStartAnimation(e)) {
      NProgress.start();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (shouldStartAnimation(e)) {
      NProgress.start();
    }
  };

  const shouldStartAnimation = (
    e:
      | React.MouseEvent<HTMLAnchorElement>
      | React.KeyboardEvent<HTMLAnchorElement>,
  ): boolean => {
    // Check if it's a left mouse click without any keyboard modifiers
    if (
      (e as React.MouseEvent<HTMLAnchorElement>).button === 0 &&
      !(e as React.MouseEvent<HTMLAnchorElement>).ctrlKey &&
      !(e as React.MouseEvent<HTMLAnchorElement>).shiftKey &&
      !(e as React.MouseEvent<HTMLAnchorElement>).metaKey
    ) {
      // Get the current pathname from window.location
      const currentPathname = window.location.pathname;

      // Check if the link's href is the same as the current pathname
      if (href === currentPathname) {
        return false; // Don't start the animation for same route links
      }

      // Check if link will open new window or tab
      if (target && target !== "_self") {
        return false;
      }

      return true;
    }

    // Check for middle mouse button click
    if ((e as React.MouseEvent<HTMLAnchorElement>).button === 1) {
      return false;
    }

    // Check for right mouse button click
    if ((e as React.MouseEvent<HTMLAnchorElement>).button === 2) {
      return false;
    }

    // Check if it's an accessibility event (e.g., screen reader activation)
    if (
      e.type === "click" &&
      (e as React.MouseEvent<HTMLAnchorElement>).detail === 0
    ) {
      return true;
    }

    return false;
  };

  return (
    <Link href={href} legacyBehavior>
      <a
        // biome-ignore lint: ignored
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className={cn(className)} // Ensure the link is keyboard focusable
        target={target}
        rel={rel}
      >
        {children}
      </a>
    </Link>
  );
};
