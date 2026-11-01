import { PublicLayout } from "@/components/common/publicLayout/publicLayout";
import Link from "next/link";

const primaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-marketing-blue-600 px-6 py-[15px] font-body text-[15px] font-semibold leading-none text-white shadow-marketing-primary transition duration-150 hover:-translate-y-px hover:bg-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600";

const secondaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full border-[1.25px] border-marketing-hair bg-marketing-surface/70 px-6 py-[15px] font-body text-[15px] font-semibold leading-none text-marketing-ink transition duration-150 hover:-translate-y-px hover:border-marketing-slate focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600";

export default function NotFound() {
  return (
    <PublicLayout>
      <main className="relative isolate flex min-h-[calc(100vh-260px)] min-w-0 flex-col items-center justify-center overflow-x-clip px-4 py-20 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-marketing-dot-grid bg-[length:22px_22px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_20%,transparent_80%)]"
        />

        <span className="font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600">
          404
        </span>

        <h1 className="mt-4 max-w-[760px] font-display text-[clamp(36px,6vw,64px)] font-bold leading-[1.04] tracking-[-0.035em] text-marketing-ink">
          This page took{" "}
          <span className="text-marketing-blue-600">a wrong turn</span>
        </h1>

        <p className="mt-4 max-w-[520px] font-body text-[16px] leading-[1.6] text-marketing-muted min-[900px]:text-[17px]">
          The page you&apos;re looking for was moved, renamed or never existed.
          Head back home, or start with a use case.
        </p>

        <div className="mt-8 flex w-full max-w-[340px] flex-col items-stretch gap-3 min-[900px]:w-auto min-[900px]:max-w-none min-[900px]:flex-row min-[900px]:items-center">
          <Link href="/" className={primaryCtaClass}>
            Back to home <span aria-hidden="true">→</span>
          </Link>
          <Link href="/use-cases" className={secondaryCtaClass}>
            See use cases
          </Link>
        </div>
      </main>
    </PublicLayout>
  );
}
