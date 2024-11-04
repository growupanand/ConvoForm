import { UserSignInButton } from "@/app/(landingPage)/_components/userButton";
import { cn } from "@/lib/utils";
import { Button } from "@convoform/ui/components/ui/button";
import { Suspense } from "react";
import BrandName from "./brandName";
import { LinkN } from "./linkN";

export function TopHeader({
  className,
  hideSignIn = false,
}: { className?: string; hideSignIn?: boolean }) {
  return (
    <div
      className={cn(
        "h-15 w-full  border-b bg-white/80 shadow-sm backdrop-blur-2xl",
        className,
      )}
    >
      <div className="container">
        <header>
          <div className="flex w-full flex-nowrap items-center justify-between gap-3 p-3">
            <BrandName className="text-xl lg:text-2xl" />
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
    </div>
  );
}

function SignInButton() {
  return (
    <LinkN href="/auth/sign-in" rel="noopener noreferrer nofollow">
      <Button variant="secondary">Sign In</Button>
    </LinkN>
  );
}
