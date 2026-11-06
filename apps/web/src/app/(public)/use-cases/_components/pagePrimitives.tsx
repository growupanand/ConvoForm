import { cn } from "@/lib/utils";
import Link from "next/link";

/** Layout and type primitives shared by the use-case pages. */

export const primaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-marketing-blue-600 px-6 py-[15px] font-body text-[15px] font-semibold leading-none text-white shadow-marketing-primary transition duration-150 hover:-translate-y-px hover:bg-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600";

export const sectionClass =
  "relative min-w-0 overflow-x-clip px-4 py-10 min-[900px]:py-14";

export const eyebrowClass =
  "mb-4 flex items-center gap-2 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600";

export const headingClass =
  "max-w-[760px] font-display text-[clamp(32px,4.2vw,50px)] font-bold leading-[1.06] tracking-[-0.03em] text-marketing-ink";

export const leadClass =
  "mt-4 max-w-[620px] font-body text-[16px] leading-[1.6] text-marketing-muted min-[900px]:text-[17px]";

export function Eyebrow({
  children,
  centered = false,
}: {
  children: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(eyebrowClass, centered && "justify-center")}
    >
      <span className="size-1.5 rounded-full bg-marketing-blue-600" />
      {children}
    </span>
  );
}

/** The register CTA every use-case page closes on. */
export function RegisterLink({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/auth/register"
      prefetch={false}
      rel="noreferrer nofollow noopener"
      className={primaryCtaClass}
    >
      {children}
    </Link>
  );
}

export function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("size-[15px] shrink-0", className)}
    >
      <circle cx="8" cy="8" r="6.5" strokeWidth="1.25" stroke="currentColor" />
      <path
        d="M8 7.2v4M8 4.9v.1"
        strokeWidth="1.25"
        strokeLinecap="round"
        stroke="currentColor"
      />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="mt-px size-5 shrink-0"
    >
      <circle
        cx="8"
        cy="8"
        r="6.5"
        strokeWidth="1.25"
        className="stroke-marketing-blue-200"
      />
      <path
        d="M5.2 8.2l1.9 1.9 3.8-4"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-marketing-blue-600"
      />
    </svg>
  );
}

export function NotIncludedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="mt-0.5 size-5 shrink-0"
    >
      <circle
        cx="12"
        cy="12"
        r="9.25"
        strokeWidth="1.25"
        className="stroke-marketing-hair"
      />
      <path
        d="M8.2 12h7.6"
        strokeWidth="1.25"
        strokeLinecap="round"
        className="stroke-marketing-label"
      />
    </svg>
  );
}
