import { BeforeAfterScene } from "@/app/(public)/(landingPage)/_components/beforeAfter";
import { FinalCtaStatic } from "@/app/(public)/(landingPage)/_components/finalCta/finalCtaStatic";
import {
  CheckIcon,
  Eyebrow,
  InfoIcon,
  NotIncludedIcon,
  RegisterLink,
  headingClass,
  leadClass,
  sectionClass,
} from "@/app/(public)/use-cases/_components/pagePrimitives";
import { jobApplicationUseCasePath, useCasesPath } from "@/lib/marketingPaths";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

import {
  type JobFieldId,
  availableToday,
  faqs,
  jobApplicationScenario,
  jobFields,
  notIncludedToday,
  steps,
} from "./content";
import { JobApplicationHeroStage } from "./jobApplicationStage";

const description =
  "Collect role, experience, current and expected CTC, notice period and location in one conversation. ConvoForm asks a follow-up when an answer is unclear.";

export const metadata: Metadata = {
  title: "Job Application Forms with AI Follow-ups",
  description,
  keywords: [
    "job application form",
    "online job application form",
    "job application form template",
    "google form for job application",
    "candidate screening form",
    "AI job application form",
    "conversational job application form",
  ],
  alternates: {
    canonical: jobApplicationUseCasePath,
  },
  twitter: {
    card: "summary_large_image",
    title: "Job Application Forms with AI Follow-ups",
    description,
  },
  openGraph: {
    title: "Job Application Forms with AI Follow-ups",
    description,
  },
};

function CreateJobApplicationLink() {
  return (
    <RegisterLink>
      Create a job application form <span aria-hidden="true">→</span>
    </RegisterLink>
  );
}

const fieldIcons: Record<JobFieldId, React.ReactNode> = {
  role: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
    </>
  ),
  experience: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  ctc: <path d="M7 5h10M7 9h10M9.5 5c3.3 0 4.5 1.8 4.5 4s-1.7 4-4.5 4H7l7 6" />,
  notice: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  location: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  links: (
    <path d="M9.5 14.5 14.5 9.5M8 11l-1.5 1.5a3.5 3.5 0 0 0 5 5L13 16M16 13l1.5-1.5a3.5 3.5 0 0 0-5-5L11 8" />
  ),
};

function FieldIcon({ id }: { id: JobFieldId }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-3.5 shrink-0"
    >
      {fieldIcons[id]}
    </svg>
  );
}

function Hero() {
  return (
    <section
      id="job-hero"
      className="relative isolate min-w-0 overflow-x-clip px-4 pb-10 pt-10 min-[900px]:pb-14 min-[900px]:pt-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-marketing-dot-grid bg-[length:22px_22px] [mask-image:linear-gradient(to_bottom,#000_20%,transparent_90%)]"
      />

      <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 items-center gap-8 min-[900px]:grid-cols-[1.08fr_0.92fr] min-[900px]:gap-14">
        <div className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-label"
          >
            <Link
              href={useCasesPath}
              className="rounded-sm transition-colors duration-150 hover:text-marketing-ink"
            >
              Use cases
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-marketing-blue-600">Job applications</span>
          </nav>

          <p className="mt-[18px] font-mono text-[13px] font-medium leading-[1.4] tracking-[0.02em] text-marketing-blue-600">
            AI job application forms for hiring teams
          </p>

          <h1 className="mt-3.5 max-w-[620px] font-display text-[clamp(36px,5vw,62px)] font-bold leading-[1.04] tracking-[-0.035em] text-marketing-ink">
            Start the screening call with the answers,{" "}
            <span className="text-marketing-blue-600">not the questions</span>
          </h1>

          <p className="mt-[18px] max-w-[560px] font-body text-[16px] leading-[1.6] text-marketing-muted min-[900px]:text-[17.5px]">
            Collect role, experience, current and expected CTC, notice period,
            location and links in one conversation. Candidates answer in their
            own words on their phone. When an answer is unclear, ConvoForm can
            ask a follow-up before it saves the answer.
          </p>

          <div className="mt-7 flex flex-col items-stretch gap-3 min-[900px]:items-start">
            <CreateJobApplicationLink />
          </div>

          <p className="mt-4 flex max-w-[520px] items-start gap-2.5 font-body text-sm leading-[1.55] text-marketing-text">
            <InfoIcon className="mt-0.5 text-marketing-label" />
            Your team makes the hiring decisions. ConvoForm helps collect the
            answers.
          </p>
        </div>

        <div className="relative isolate min-w-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-marketing-dot-grid bg-[length:22px_22px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]"
          />
          <JobApplicationHeroStage />
        </div>
      </div>
    </section>
  );
}

function PainAndBeforeAfter() {
  return (
    <section
      id="why"
      aria-labelledby="why-heading"
      className={cn(sectionClass, "pt-8 min-[900px]:pt-10")}
    >
      <div className="mx-auto w-full max-w-[1160px]">
        <div className="grid grid-cols-1 items-end gap-4 min-[900px]:grid-cols-2 min-[900px]:gap-14">
          <div>
            <h2 id="why-heading" className={headingClass}>
              <Eyebrow>The problem</Eyebrow>A CV and a phone number{" "}
              <span className="text-marketing-blue-600">
                don&apos;t answer your screening questions
              </span>
            </h2>
          </div>

          <div className="max-w-[620px] font-body text-[16px] leading-[1.65] text-marketing-muted min-[900px]:text-[16.5px]">
            <p>
              Applications often arrive as a name, a phone number and a CV.
              Experience, CTC, notice period and whether the candidate can
              relocate still come out on a call, one candidate at a time.
            </p>
            <p className="mt-3">
              A standard form can ask for these. But free text needs a second
              question when the meaning is unclear: &quot;6&quot; doesn&apos;t
              say whether it&apos;s current or expected CTC, &quot;3-4&quot; is
              a range, and &quot;can join soon&quot; isn&apos;t a notice period.
            </p>
          </div>
        </div>

        <div className="mt-10 min-[900px]:mt-12">
          <BeforeAfterScene
            scenario={jobApplicationScenario}
            active
            columns={6}
            valuesLabel="What your recruiter sees"
            ariaLabel="Example: a candidate types 6 for CTC. A standard form saves “6”. ConvoForm asks whether it is current or expected CTC and saves ₹6 LPA current, ₹8 LPA expected."
          />
        </div>

        <p className="mt-5 max-w-[820px] font-body text-sm leading-[1.6] text-marketing-text">
          The candidate types &quot;6&quot;. The follow-up asks whether that is
          current or expected CTC, so the saved answer is ₹6 LPA current and ₹8
          LPA expected.
        </p>
      </div>
    </section>
  );
}

function Steps() {
  return (
    <section
      aria-labelledby="steps-heading"
      className={cn(sectionClass, "pt-8 min-[900px]:pt-12")}
    >
      <div className="mx-auto w-full max-w-[1160px]">
        <div className="text-center">
          <h2
            id="steps-heading"
            className={cn(headingClass, "mx-auto text-center")}
          >
            <Eyebrow centered>How it works</Eyebrow>
            Keep your screening questions.{" "}
            <span className="text-marketing-blue-600">
              Change how you ask for them.
            </span>
          </h2>
          <p className={cn(leadClass, "mx-auto text-center")}>
            You decide what a complete answer looks like. ConvoForm asks the
            questions and follows up when an answer is unclear.
          </p>
        </div>

        <ol className="mx-auto mt-10 grid max-w-[1080px] list-none grid-cols-1 gap-6 p-0 min-[900px]:mt-12 min-[900px]:grid-cols-3 min-[900px]:gap-7">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="border-t-[1.25px] border-marketing-hair pt-[18px]"
            >
              <span className="font-mono text-[11px] font-medium leading-none tracking-[0.08em] text-marketing-blue-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-[20px] font-semibold leading-[1.2] tracking-[-0.01em] text-marketing-ink">
                {step.title}
              </h3>
              <p className="mt-2 font-body text-[15px] leading-[1.55] text-marketing-muted">
                {step.body}
              </p>
              {index === 0 ? (
                <p className="mt-3">
                  <Link
                    href="https://docs.convoform.com/concepts/form-creation"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1.5 border-b border-marketing-blue-200 font-body text-sm font-semibold leading-[1.4] text-marketing-blue-600 transition-colors duration-150 hover:text-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600"
                  >
                    Read how form creation works{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                </p>
              ) : null}
            </li>
          ))}
        </ol>

        <div className="mt-10 flex justify-center">
          <div className="flex w-full max-w-[400px] flex-col items-stretch min-[900px]:max-w-none min-[900px]:items-center">
            <CreateJobApplicationLink />
          </div>
        </div>
      </div>
    </section>
  );
}

function Fields() {
  return (
    <section
      aria-labelledby="fields-heading"
      className={cn(sectionClass, "pt-8 min-[900px]:pt-12")}
    >
      <div className="mx-auto w-full max-w-[1160px]">
        <h2 id="fields-heading" className={headingClass}>
          <Eyebrow>What to collect</Eyebrow>
          The six fields
        </h2>
        <p className={leadClass}>
          A starting point for most openings, from store staff to engineers.
          Rename, drop or add fields for your role.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border-[1.25px] border-marketing-hair bg-marketing-hair-soft min-[900px]:grid-cols-2 min-[1100px]:grid-cols-3">
          {jobFields.map((field) => (
            <div
              key={field.id}
              className="min-w-0 bg-marketing-surface p-5 min-[900px]:px-6 min-[900px]:py-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full border-[1.25px] border-marketing-blue-200 bg-marketing-blue-50 px-2.5 py-1.5 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600">
                <FieldIcon id={field.id} />
                {field.label}
              </span>

              <p className="mt-3 font-body text-[14.5px] leading-[1.5] text-marketing-muted">
                {field.detail}
              </p>

              <div className="mt-[18px] font-mono text-[11px] uppercase leading-none tracking-[0.08em] text-marketing-label">
                What to ask for
              </div>
              <div className="mt-[7px] font-display text-[17px] font-semibold leading-[1.35] tracking-[-0.005em] text-marketing-ink">
                {field.ask}
              </div>

              <div className="mt-3 font-mono text-[11px] uppercase leading-none tracking-[0.08em] text-marketing-label">
                Why it helps the recruiter
              </div>
              <p className="mt-[7px] font-body text-[14.5px] leading-[1.55] text-marketing-muted">
                {field.why}
              </p>

              <div className="mt-3.5 border-t border-dashed border-marketing-hair pt-3 font-mono text-xs leading-[1.4] text-marketing-text">
                e.g.{" "}
                <span className="font-medium text-marketing-ink">
                  {field.example}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-[18px] flex max-w-[720px] items-start gap-3 font-body text-[15px] leading-[1.6] text-marketing-muted">
          <InfoIcon className="mt-0.5 text-marketing-blue-600" />
          Need a CV? Add a file upload field. Candidates can attach one PDF or
          JPG up to 5 MB, and files are kept for 30 days in the beta. Add your
          own name, phone and email fields too.
        </p>
      </div>
    </section>
  );
}

function Scope() {
  return (
    <section
      aria-labelledby="scope-heading"
      className={cn(sectionClass, "pt-8 min-[900px]:pt-12")}
    >
      <div className="mx-auto w-full max-w-[1160px]">
        <h2 id="scope-heading" className={headingClass}>
          <Eyebrow>Scope</Eyebrow>
          What you can use today,{" "}
          <span className="text-marketing-blue-600">
            and what isn&apos;t included
          </span>
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-3.5 min-[900px]:grid-cols-2 min-[900px]:gap-5">
          <div className="rounded-[22px] border-[1.25px] border-marketing-blue-200 bg-marketing-surface p-6 min-[900px]:p-7">
            <h3 className="font-display text-[20px] font-semibold leading-[1.2] tracking-[-0.01em] text-marketing-ink">
              Available today
            </h3>
            <ul className="mt-[18px] grid list-none gap-3.5 p-0">
              {availableToday.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 font-body text-[15.5px] leading-[1.55] text-marketing-muted"
                >
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[22px] border-[1.25px] border-marketing-hair bg-marketing-surface/60 p-6 min-[900px]:p-7">
            <h3 className="font-display text-[20px] font-semibold leading-[1.2] tracking-[-0.01em] text-marketing-ink">
              Not included today
            </h3>
            <ul className="mt-[18px] grid list-none gap-3.5 p-0">
              {notIncludedToday.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 font-body text-[15.5px] leading-[1.55] text-marketing-muted"
                >
                  <NotIncludedIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section
      aria-labelledby="faq-heading"
      className={cn(sectionClass, "pt-8 min-[900px]:pt-12")}
    >
      <div className="mx-auto w-full max-w-[1160px]">
        <div className="text-center">
          <h2
            id="faq-heading"
            className={cn(headingClass, "mx-auto text-center")}
          >
            <Eyebrow centered>FAQ</Eyebrow>
            Questions from{" "}
            <span className="text-marketing-blue-600">hiring teams</span>
          </h2>
        </div>

        <div className="mx-auto mt-9 max-w-[820px] border-t-[1.25px] border-marketing-hair">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              open={index === 0}
              className="group border-b-[1.25px] border-marketing-hair"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-[18px] font-display text-[16.5px] font-semibold leading-[1.3] text-marketing-ink transition-colors duration-200 hover:text-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600 min-[900px]:py-[22px] min-[900px]:text-[18px] group-open:text-marketing-blue-700 [&::-webkit-details-marker]:hidden">
                <span className="flex items-baseline">
                  <span
                    aria-hidden="true"
                    className="mr-3.5 shrink-0 font-mono text-[11px] font-medium leading-none tracking-[0.06em] text-marketing-label"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {faq.question}
                </span>

                <span
                  aria-hidden="true"
                  className="relative size-7 shrink-0 rounded-full border-[1.25px] border-marketing-hair transition-[transform,border-color] [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.65,0,0.35,1)] group-open:rotate-45 group-open:border-marketing-blue-300 motion-reduce:transition-none"
                >
                  <span className="absolute left-1/2 top-1/2 h-0 w-[11px] -translate-x-1/2 -translate-y-1/2 border-t-[1.25px] border-marketing-ink" />
                  <span className="absolute left-1/2 top-1/2 h-0 w-[11px] -translate-x-1/2 -translate-y-1/2 rotate-90 border-t-[1.25px] border-marketing-ink" />
                </span>
              </summary>

              <div className="max-w-[620px] pb-5 font-body text-[15px] leading-[1.65] text-marketing-muted min-[900px]:pb-6 min-[900px]:pr-11 min-[900px]:text-[15.5px]">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section
      aria-labelledby="close-heading"
      className="min-w-0 px-4 pb-[72px] pt-10"
    >
      <div className="mx-auto min-w-0 max-w-[1160px]">
        <div className="relative isolate overflow-hidden rounded-[26px] border-[1.25px] border-marketing-hair bg-marketing-surface px-[22px] pb-[26px] pt-9 min-[900px]:grid min-[900px]:grid-cols-2 min-[900px]:items-center min-[900px]:gap-6 min-[900px]:rounded-[32px] min-[900px]:py-16 min-[900px]:pl-16 min-[900px]:pr-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-marketing-dot-grid bg-[length:22px_22px] [mask-image:radial-gradient(ellipse_90%_60%_at_50%_80%,#000_25%,transparent_80%)] min-[900px]:[mask-image:radial-gradient(ellipse_70%_90%_at_72%_50%,#000_25%,transparent_80%)]"
          />

          <div className="min-w-0">
            <h2
              id="close-heading"
              className="max-w-[560px] font-display text-[clamp(34px,4.6vw,56px)] font-bold leading-[1.04] tracking-[-0.03em] text-marketing-ink"
            >
              <Eyebrow>Get started</Eyebrow>
              Give your next screening call{" "}
              <span className="text-marketing-blue-600">
                a better starting point
              </span>
            </h2>

            <p className="mt-4 max-w-[470px] font-body text-[15.5px] leading-[1.6] text-marketing-muted min-[900px]:text-[17px]">
              Collect experience, CTC, notice period and location first, so the
              call is about fit, not basics.
            </p>

            <div className="mt-7 flex flex-col items-stretch gap-3 min-[900px]:flex-row min-[900px]:flex-wrap">
              <CreateJobApplicationLink />
            </div>

            <p className="mt-5 max-w-[470px] font-mono text-[12.5px] leading-[1.6] tracking-[0.01em] text-marketing-text">
              Start with role, experience, CTC, notice period, location and
              links. Review the form, test a few unclear answers, then share it.
            </p>
          </div>

          <div className="mt-4 min-[900px]:-my-4 min-[900px]:mt-0">
            <FinalCtaStatic />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function JobApplicationUseCasePage() {
  return (
    <main className="min-w-0">
      <Hero />
      <PainAndBeforeAfter />
      <Steps />
      <Fields />
      <Scope />
      <Faq />
      <FinalCta />
    </main>
  );
}
