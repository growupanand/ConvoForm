import { GithubStars } from "@/app/(public)/(landingPage)/_components/githubStar";
import { UserSignInButton } from "@/app/(public)/(landingPage)/_components/userButton";
import { SignInButton } from "@/components/common/publicLayout/signInButton";
import { useCasesPath } from "@/lib/marketingPaths";
import { cn } from "@/lib/utils";
import { Github } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import BrandNameLink from "../brandName";

export function PublicLayoutHeader({
  className,
  hideSignIn = false,
}: { className?: string; hideSignIn?: boolean }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-marketing-hair-soft bg-marketing-paper/86 backdrop-blur-[14px]",
        className,
      )}
    >
      <div className="mx-auto flex h-[58px] w-full max-w-[1160px] items-center justify-between gap-3 px-4 min-[900px]:h-16 min-[900px]:px-6">
        <BrandNameLink className="text-[20px] leading-none tracking-[-0.01em] min-[900px]:text-[22px]" />

        {!hideSignIn && (
          <nav
            aria-label="Main"
            className="flex items-center gap-1.5 min-[900px]:gap-1.5"
          >
            <Link
              href={useCasesPath}
              className="hidden rounded-full px-3 py-2.5 text-sm font-medium text-marketing-muted transition-colors duration-200 hover:text-marketing-ink min-[900px]:inline-flex"
            >
              Use cases
            </Link>

            <Link
              href="https://github.com/growupanand/ConvoForm"
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label="Visit the ConvoForm GitHub repository"
              className="hidden items-center gap-1.5 rounded-full border-[1.25px] border-marketing-hair px-3 py-2 font-mono text-[12.5px] leading-none text-marketing-muted transition-colors duration-200 hover:border-marketing-slate hover:text-marketing-ink min-[900px]:inline-flex"
            >
              <Github className="size-3.5" aria-hidden="true" />
              GitHub
              <Suspense
                fallback={
                  <span className="font-mono text-[12.5px] text-marketing-slate">
                    ★
                  </span>
                }
              >
                <GithubStars />
              </Suspense>
            </Link>

            <Suspense fallback={<SignInButton />}>
              <UserSignInButton />
            </Suspense>

            <Link
              href="/auth/register"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center justify-center rounded-full bg-marketing-blue-600 px-4 py-2.5 text-sm font-semibold leading-none text-white shadow-[0_10px_26px_-14px_rgba(37,99,235,0.7)] transition duration-150 hover:-translate-y-px hover:bg-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600"
            >
              Start free
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
