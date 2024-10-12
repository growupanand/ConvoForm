"use client";

import { AuthProvider } from "@/components/authProvider";
import Spinner from "@/components/common/spinner";
import { useMediaQuery } from "@/hooks/use-media-query";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { DesktopOnlyAlert } from "./_components/desktopOnlyAlert";

const DesktopLayout = dynamic(
  () => import("@/app/(protectedPage)/_components/desktopOnlyLayout"),
  { ssr: false },
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isDesktop, isLoading] = useMediaQuery("(min-width: 1024px)");

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!isDesktop) {
    return <DesktopOnlyAlert />;
  }

  return (
    <AuthProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <DesktopLayout>{children}</DesktopLayout>
      </Suspense>
    </AuthProvider>
  );
}
