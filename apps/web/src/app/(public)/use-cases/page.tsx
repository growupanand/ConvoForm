import { studyAbroadUseCasePath } from "@/lib/marketingPaths";
import type { Metadata } from "next";
import Link from "next/link";

const useCasesDescription =
  "See how teams use ConvoForm to collect the details they need before the first call, starting with study-abroad student intake.";

export const metadata: Metadata = {
  title: "Use cases",
  description: useCasesDescription,
  alternates: {
    canonical: "/use-cases",
  },
  openGraph: {
    title: "Use cases",
    description: useCasesDescription,
    images: ["/api/og"],
  },
};

const fieldChips = [
  "Destination",
  "Course",
  "Intake",
  "Marks",
  "Budget",
  "Tests",
] as const;

const cardClass =
  "group relative isolate flex min-w-0 flex-col overflow-hidden rounded-[22px] border-[1.25px] border-marketing-hair bg-marketing-surface p-6 transition-colors duration-200 hover:border-marketing-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600 min-[900px]:rounded-[26px] min-[900px]:p-9";

export default function UseCasesPage() {
  return (
    <main className="min-w-0">
      <section className="relative isolate min-w-0 overflow-x-clip px-4 pb-10 pt-10 min-[900px]:pb-14 min-[900px]:pt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-marketing-dot-grid bg-[length:22px_22px] [mask-image:linear-gradient(to_bottom,#000_20%,transparent_90%)]"
        />

        <div className="mx-auto w-full max-w-[1160px]">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-marketing-blue-600"
            />
            Use cases
          </span>

          <h1 className="mt-4 max-w-[760px] font-display text-[clamp(36px,5vw,62px)] font-bold leading-[1.04] tracking-[-0.035em] text-marketing-ink">
            Start with the work{" "}
            <span className="text-marketing-blue-600">you already do</span>
          </h1>

          <p className="mt-[18px] max-w-[620px] font-body text-[16px] leading-[1.6] text-marketing-muted min-[900px]:text-[17px]">
            Each use case collects the details your team actually needs, asks a
            follow-up when an answer is unclear, and leaves you a clean record
            to review before the first conversation.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="use-cases-heading"
        className="min-w-0 px-4 pb-16 pt-2 min-[900px]:pb-24"
      >
        <div className="mx-auto w-full max-w-[1160px]">
          <h2 id="use-cases-heading" className="sr-only">
            Use cases
          </h2>

          <ul className="grid list-none grid-cols-1 gap-5 p-0">
            <li className="min-w-0 max-w-[760px]">
              <Link href={studyAbroadUseCasePath} className={cardClass}>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 bg-marketing-dot-grid bg-[length:22px_22px] [mask-image:radial-gradient(ellipse_90%_60%_at_50%_80%,#000_25%,transparent_80%)] min-[900px]:[mask-image:radial-gradient(ellipse_70%_90%_at_72%_50%,#000_25%,transparent_80%)]"
                />

                <span className="font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600">
                  Education
                </span>

                <h3 className="mt-4 font-display text-[clamp(24px,2.6vw,32px)] font-semibold leading-[1.12] tracking-[-0.02em] text-marketing-ink">
                  Study abroad
                </h3>

                <p className="mt-3 max-w-[520px] font-body text-[15px] leading-[1.6] text-marketing-muted">
                  Collect a full student profile — destination, course, intake,
                  marks, budget and test status — before the first counselling
                  call.
                </p>

                <ul className="mt-6 flex list-none flex-wrap gap-1.5 p-0">
                  {fieldChips.map((chip) => (
                    <li
                      key={chip}
                      className="rounded-full border border-marketing-hair-soft bg-marketing-surface px-2.5 py-1.5 font-body text-[11.5px] font-medium leading-none text-marketing-muted"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>

                <span className="mt-7 inline-flex items-center gap-2 self-start border-b border-marketing-blue-200 pb-0.5 font-body text-sm font-semibold leading-[1.4] text-marketing-blue-600 transition-colors duration-150 group-hover:text-marketing-blue-700">
                  See the study-abroad use case{" "}
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          </ul>

          <p className="mt-8 max-w-[620px] font-body text-[15px] leading-[1.6] text-marketing-muted">
            Have a workflow that would fit?{" "}
            <a
              href="https://convoform.canny.io/feature-requests"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-semibold text-marketing-blue-600 underline decoration-marketing-blue-200 underline-offset-4 transition-colors duration-150 hover:text-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600"
            >
              Suggest a use case
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
