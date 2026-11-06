import Link from "next/link";

import { BrandLogo } from "@/components/common/brandLogo";
import { useCasesPath } from "@/lib/marketingPaths";
import { cn } from "@/lib/utils";

const footerLinks = [
  { label: "Use cases", href: useCasesPath, external: false },
  {
    label: "Documentation",
    href: "https://docs.convoform.com",
    external: true,
  },
  { label: "Changelog", href: "/changelog", external: false },
  {
    label: "GitHub",
    href: "https://github.com/growupanand/ConvoForm",
    external: true,
  },
  { label: "Email", href: "mailto:contact@convoform.com", external: false },
  { label: "Privacy", href: "/privacy", external: false },
  { label: "Terms", href: "/terms", external: false },
] as const;

export function PublicLayoutFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn("mt-6 border-t-[1.25px] border-marketing-hair", className)}
    >
      <div className="mx-auto flex w-full max-w-[1160px] flex-col items-center justify-between gap-5 px-4 py-9 min-[900px]:flex-row min-[900px]:items-center min-[900px]:px-6 min-[900px]:py-11">
        <div className="flex flex-col items-center gap-5 min-[900px]:flex-row min-[900px]:gap-5">
          <BrandLogo variant="lockup" size={24} href="/" />
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center justify-center gap-x-[22px] gap-y-2 text-sm text-marketing-muted"
          >
            {footerLinks.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="rounded-full py-1 transition-colors duration-200 hover:text-marketing-ink"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-full py-1 transition-colors duration-200 hover:text-marketing-ink"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        <Link
          href="https://github.com/growupanand"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="font-mono text-xs text-marketing-muted transition-colors duration-200 hover:text-marketing-ink"
        >
          Made by Utkarsh Anand
        </Link>
      </div>
    </footer>
  );
}
