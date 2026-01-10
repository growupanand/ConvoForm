import { UserSignInButton } from "@/app/(public)/(landingPage)/_components/userButton";
import { SignInButton } from "@/components/common/publicLayout/signInButton";
import { cn } from "@/lib/utils";
import { Button } from "@convoform/ui";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
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
              <Button variant="link" size="sm" asChild>
                <Link
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  aria-label="Visit documentation website"
                  href="https://docs.convoform.com"
                >
                  <span className="flex items-center">
                    <span>Documentation</span>{" "}
                    <ExternalLink className="ms-2 h-4 w-4" />
                  </span>
                </Link>
              </Button>
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
