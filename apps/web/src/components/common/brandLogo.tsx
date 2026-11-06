import { cn } from "@/lib/utils";
import Link from "next/link";
import type { HTMLAttributes } from "react";

type BrandLogoVariant = "lockup" | "mark" | "wordmark";

type Props = {
  variant: BrandLogoVariant;
  size?: number;
  href?: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className">;

function BrandMark({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      aria-hidden="true"
      className="shrink-0"
    >
      {/* V5 master geometry, no tile — the page provides the background. */}
      <rect
        x="80"
        y="144"
        width="272"
        height="88"
        rx="44"
        className="fill-marketing-slate dark:fill-marketing-hair"
      />
      <rect
        x="160"
        y="280"
        width="272"
        height="88"
        rx="44"
        className="fill-marketing-blue-600 dark:fill-marketing-blue-400"
      />
    </svg>
  );
}

function BrandWordmark({ size }: { size: number }) {
  return (
    <span
      className="font-display font-semibold leading-none tracking-[-0.01em] text-foreground"
      style={{ fontSize: size * 0.9 }}
    >
      <span className="text-brand-600">Convo</span>Form
    </span>
  );
}

export function BrandLogo({
  variant,
  size = 24,
  href,
  className,
  ...rest
}: Props) {
  const content = (
    <>
      {variant !== "wordmark" && <BrandMark size={size} />}
      {variant !== "mark" && <BrandWordmark size={size} />}
    </>
  );

  const gapClass = size <= 18 ? "gap-1.5" : size <= 22 ? "gap-2" : "gap-2.5";
  const classes = cn(
    "inline-flex items-center",
    gapClass,
    href && "min-h-8",
    variant === "mark" && "min-w-8 justify-center",
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...rest}
        aria-label="ConvoForm home"
      >
        {content}
      </Link>
    );
  }

  return (
    <span className={classes} {...rest}>
      {content}
    </span>
  );
}
