"use client";

import { AuthProvider } from "@/components/authProvider";
import Spinner from "@/components/common/spinner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { isMobileAllowedPath } from "@/lib/isMobileAllowedPath";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { MobileGate } from "./_components/mobileGate";

const DesktopLayout = dynamic(
  () => import("@/app/(protectedPage)/_components/desktopOnlyLayout"),
  { ssr: false },
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDesktop, isLoading] = useMediaQuery("(min-width: 1024px)");
  const allowOnMobile = isMobileAllowedPath(pathname);

  let content = children;
  if (!allowOnMobile) {
    if (isLoading) {
      content = (
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner size="lg" label="Loading..." />
        </div>
      );
    } else if (isDesktop) {
      content = (
        <Suspense fallback={<div>Loading...</div>}>
          <DesktopLayout>{children}</DesktopLayout>
        </Suspense>
      );
    } else {
      content = <MobileGate />;
    }
  }

  return <AuthProvider>{content}</AuthProvider>;
}
