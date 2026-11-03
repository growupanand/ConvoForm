import { cn } from "@/lib/utils";
import Link from "next/link";

import { HeroFrames } from "./heroStage/heroFrames";
import { HERO_LABEL } from "./heroStage/heroScene";
import { HeroStage } from "./heroStage/heroStage";

const proofPoints = [
  "No credit card",
  "Open source (Apache 2.0)",
  "Cloud or self-host",
  "Works in any phone browser",
] as const;

const secondaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full border-[1.25px] border-marketing-hair bg-marketing-surface/70 px-6 py-[15px] font-body text-[15px] font-semibold leading-none text-marketing-ink transition duration-150 hover:-translate-y-px hover:border-marketing-slate focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600";

function DemoPlayIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      className="fill-marketing-blue-600"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ProofCheck() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="mt-px size-[13px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.5" className="stroke-marketing-blue-200" />
      <path d="M5.2 8.2l1.9 1.9 3.8-4" className="stroke-marketing-blue-600" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-6 pt-9 text-center min-[900px]:pt-14">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.07)_1px,transparent_0)] bg-[length:22px_22px] [mask-image:linear-gradient(to_bottom,#000_30%,transparent_85%)]"
      />

      <div className="mx-auto max-w-[1160px]">
        <h1 className="mx-auto max-w-[900px] font-display text-[clamp(40px,6.4vw,76px)] font-bold leading-[1.02] tracking-[-0.035em] text-marketing-ink">
          Forms that{" "}
          <span className="whitespace-nowrap text-marketing-blue-600">
            talk back.
          </span>
        </h1>

        <p className="mx-auto mt-[18px] max-w-[620px] font-body text-[clamp(15.5px,1.5vw,18px)] leading-[1.55] text-marketing-muted">
          ConvoForm chats with people, asks follow-ups when an answer is vague,
          and hands you clean, structured data.
        </p>

        <div className="mx-auto mt-[26px] flex max-w-[340px] flex-col items-stretch gap-3 min-[900px]:max-w-none min-[900px]:flex-row min-[900px]:justify-center">
          <Link
            href="/auth/register"
            prefetch={false}
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-marketing-blue-600 px-6 py-[15px] font-body text-[15px] font-semibold leading-none text-white shadow-[0_10px_26px_-14px_rgba(37,99,235,0.7)] transition duration-150 hover:-translate-y-px hover:bg-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600"
          >
            Create your free form <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="#demo"
            className={cn(secondaryCtaClass, "hidden lg:inline-flex")}
          >
            <DemoPlayIcon />
            Try the demo
          </Link>
          <Link
            href="/view/demo"
            rel="noopener noreferrer nofollow"
            className={cn(secondaryCtaClass, "inline-flex lg:hidden")}
          >
            <DemoPlayIcon />
            Try the demo
          </Link>
        </div>

        <Link
          href="/view/demo"
          rel="noopener noreferrer nofollow"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-mono text-[12px] leading-none text-marketing-blue-600 underline decoration-marketing-blue-200 underline-offset-4 lg:hidden"
        >
          Try it on your phone <span aria-hidden="true">→</span>
        </Link>

        <ul className="mx-auto mt-[22px] grid max-w-[343px] grid-cols-2 gap-x-3.5 gap-y-2.5 text-left font-mono text-xs leading-[1.4] tracking-[0.01em] text-marketing-text min-[900px]:flex min-[900px]:max-w-none min-[900px]:flex-wrap min-[900px]:justify-center min-[900px]:gap-x-[22px]">
          {proofPoints.map((point) => (
            <li key={point} className="flex items-start gap-[7px]">
              <ProofCheck />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <HeroStage label={HERO_LABEL}>
          <HeroFrames />
        </HeroStage>

        <p className="mt-3 text-center font-mono text-xs leading-[1.4] tracking-[0.04em] text-marketing-label">
          Illustrative example
        </p>
      </div>
    </section>
  );
}
