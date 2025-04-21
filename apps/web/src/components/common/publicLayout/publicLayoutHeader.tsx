import { UserSignInButton } from "@/app/(public)/(landingPage)/_components/userButton";
import { SignInButton } from "@/components/common/publicLayout/signInButton";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import BrandNameLink from "../brandName";

export function PublicLayoutHeader({
  className,
  hideSignIn = false,
}: { className?: string; hideSignIn?: boolean }) {
  return (
    <div
      className={cn(
        "container mx-auto lg:rounded-full border bg-white/80 shadow-sm backdrop-blur-2xl",
        className,
      )}
    >
      <header>
        <div className="flex w-full flex-nowrap items-center justify-between gap-3 p-3">
          <BrandNameLink className="text-xl lg:text-2xl" />
          {!hideSignIn && (
            <nav className="flex items-center gap-3">
              <Suspense fallback={<SignInButton />}>
                <UserSignInButton />
              </Suspense>
            </nav>
          )}
        </div>
      </header>
    </div>
  );
}
