import { cn } from "@/lib/utils";
import Link from "next/link";

import { FinalCtaStage } from "./finalCtaStage";

const primaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-marketing-blue-600 px-6 py-[15px] font-body text-[15px] font-semibold leading-none text-white shadow-marketing-primary transition duration-150 hover:-translate-y-px hover:bg-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600";

const secondaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full border-[1.25px] border-marketing-hair bg-marketing-surface/70 px-6 py-[15px] font-body text-[15px] font-semibold leading-none text-marketing-ink transition duration-150 hover:-translate-y-px hover:border-marketing-slate focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600";

function DemoPlayIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      className="text-marketing-blue-600"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function FinalCtaSection() {
  return (
    <section
      id="get-started"
      aria-labelledby="final-cta-heading"
      className="min-w-0 px-4 pb-[72px] pt-10"
    >
      <div className="mx-auto min-w-0 max-w-[1160px]">
        <div className="relative isolate overflow-hidden rounded-[26px] border-[1.25px] border-marketing-hair bg-marketing-surface px-[22px] pb-[26px] pt-9 min-[900px]:grid min-[900px]:grid-cols-2 min-[900px]:items-center min-[900px]:gap-6 min-[900px]:rounded-[32px] min-[900px]:py-16 min-[900px]:pl-16 min-[900px]:pr-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-marketing-dot-grid bg-[length:22px_22px] [mask-image:radial-gradient(ellipse_90%_60%_at_50%_80%,#000_25%,transparent_80%)] min-[900px]:[mask-image:radial-gradient(ellipse_70%_90%_at_72%_50%,#000_25%,transparent_80%)]"
          />

          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-marketing-blue-600"
              />
              Get started
            </span>

            <h2
              id="final-cta-heading"
              className="mt-[18px] max-w-[560px] font-display text-[clamp(34px,4.6vw,56px)] font-bold leading-[1.04] tracking-[-0.03em] text-marketing-ink"
            >
              Ready to let your form{" "}
              <span className="text-marketing-blue-600">talk back?</span>
            </h2>

            <p className="mt-4 max-w-[470px] font-body text-[15.5px] leading-[1.55] text-marketing-muted min-[900px]:text-[17px]">
              Turn your next form into a conversation that asks the right
              follow-up and hands you clean answers.
            </p>

            <div className="mt-7 flex max-w-[340px] flex-col items-stretch gap-3 min-[900px]:max-w-none min-[900px]:flex-row min-[900px]:flex-wrap">
              <Link href="/auth/register" className={primaryCtaClass}>
                Start free <span aria-hidden="true">→</span>
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

            <p className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] leading-[1.5] tracking-[0.02em] text-marketing-text min-[900px]:text-xs">
              <span>Free to start</span>
              <span aria-hidden="true" className="text-marketing-hair">
                ·
              </span>
              <span>No credit card</span>
              <span
                aria-hidden="true"
                className="hidden text-marketing-hair min-[900px]:inline"
              >
                ·
              </span>
              <a
                href="https://github.com/growupanand/ConvoForm"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="rounded-sm underline decoration-marketing-hair decoration-dotted underline-offset-4 transition-colors duration-200 hover:text-marketing-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600"
              >
                Open source (Apache 2.0)
              </a>
            </p>
          </div>

          <div className="-mx-1.5 mt-2.5 min-[900px]:m-0">
            <FinalCtaStage />
          </div>
        </div>
      </div>
    </section>
  );
}
