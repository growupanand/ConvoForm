import { BeforeAfterScene } from "@/app/(public)/(landingPage)/_components/beforeAfter";
import { FinalCtaStatic } from "@/app/(public)/(landingPage)/_components/finalCta/finalCtaStatic";
import { studyAbroadUseCasePath, useCasesPath } from "@/lib/marketingPaths";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

import {
  type IntakeFieldId,
  availableToday,
  faqs,
  intakeFields,
  notIncludedToday,
  steps,
  studentProfile,
  studyAbroadScenario,
} from "./content";

export const metadata: Metadata = {
  title: "Student Intake Forms for Study Abroad Consultants",
  description:
    "Collect destination, course, intake, marks, budget and test details through an AI conversation. Give your study-abroad counsellors context before the first call.",
  keywords: [
    "student intake form for study abroad consultants",
    "study abroad enquiry form",
    "student profile collection",
    "conversational forms for education consultants",
    "study abroad lead qualification",
    "AI student intake form",
  ],
  alternates: {
    canonical: studyAbroadUseCasePath,
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Intake Forms for Study Abroad Consultants",
    description:
      "Collect destination, course, intake, marks, budget and test details through an AI conversation. Give your study-abroad counsellors context before the first call.",
  },
  openGraph: {
    title: "Student Intake Forms for Study Abroad Consultants",
    description:
      "Collect destination, course, intake, marks, budget and test details through an AI conversation. Give your study-abroad counsellors context before the first call.",
  },
};

const primaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-marketing-blue-600 px-6 py-[15px] font-body text-[15px] font-semibold leading-none text-white shadow-marketing-primary transition duration-150 hover:-translate-y-px hover:bg-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600";

const sectionClass =
  "relative min-w-0 overflow-x-clip px-4 py-10 min-[900px]:py-14";

const eyebrowClass =
  "mb-4 flex items-center gap-2 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600";

const headingClass =
  "max-w-[760px] font-display text-[clamp(32px,4.2vw,50px)] font-bold leading-[1.06] tracking-[-0.03em] text-marketing-ink";

const leadClass =
  "mt-4 max-w-[620px] font-body text-[16px] leading-[1.6] text-marketing-muted min-[900px]:text-[17px]";

function Eyebrow({
  children,
  centered = false,
}: {
  children: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <span className={cn(eyebrowClass, centered && "justify-center")}>
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-marketing-blue-600"
      />
      {children}
    </span>
  );
}

function CreateIntakeLink() {
  return (
    <Link
      href="/auth/register"
      prefetch={false}
      rel="noreferrer nofollow noopener"
      className={primaryCtaClass}
    >
      Create a student intake form <span aria-hidden="true">→</span>
    </Link>
  );
}

function InfoIcon({ className }: { className?: string }) {
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

const fieldIcons: Record<IntakeFieldId, React.ReactNode> = {
  destination: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  course: (
    <>
      <path d="M2 9.5 12 5l10 4.5L12 14z" />
      <path d="M6 11.5V16c0 1.6 2.7 3 6 3s6-1.4 6-3v-4.5" />
    </>
  ),
  intake: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  marks: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  budget: (
    <path d="M7 5h10M7 9h10M9.5 5c3.3 0 4.5 1.8 4.5 4s-1.7 4-4.5 4H7l7 6" />
  ),
  tests: (
    <>
      <path d="M9 4h6l1 3H8z" />
      <rect x="5" y="6" width="14" height="15" rx="2" />
      <path d="M9 12h6M9 16h4" />
    </>
  ),
};

function FieldIcon({ id }: { id: IntakeFieldId }) {
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

function CheckIcon() {
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

function NotIncludedIcon() {
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

function Hero() {
  return (
    <section className="relative isolate min-w-0 overflow-x-clip px-4 pb-10 pt-10 min-[900px]:pb-14 min-[900px]:pt-16">
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
            <span className="text-marketing-blue-600">Study abroad</span>
          </nav>

          <p className="mt-[18px] font-mono text-[13px] font-medium leading-[1.4] tracking-[0.02em] text-marketing-blue-600">
            AI student intake forms for study-abroad consultancies
          </p>

          <h1 className="mt-3.5 max-w-[620px] font-display text-[clamp(36px,5vw,62px)] font-bold leading-[1.04] tracking-[-0.035em] text-marketing-ink">
            Start counselling with a student profile,{" "}
            <span className="text-marketing-blue-600">not a blank slate</span>
          </h1>

          <p className="mt-[18px] max-w-[560px] font-body text-[16px] leading-[1.6] text-marketing-muted min-[900px]:text-[17.5px]">
            Collect destination, course, intake, marks, budget and test status
            before the first call. Students answer in their own words; ConvoForm
            can ask a follow-up when details are unclear.
          </p>

          <div className="mt-7 flex flex-col items-stretch gap-3 min-[900px]:items-start">
            <CreateIntakeLink />
          </div>

          <p className="mt-4 flex max-w-[520px] items-start gap-2.5 font-body text-sm leading-[1.55] text-marketing-text">
            <InfoIcon className="mt-0.5 text-marketing-label" />
            Your counsellors make the recommendations. ConvoForm helps collect
            the context.
          </p>
        </div>

        <figure className="relative isolate min-w-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-marketing-dot-grid bg-[length:22px_22px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]"
          />

          <div className="flex items-center justify-between gap-2.5 border-b-[1.25px] border-marketing-hair-soft px-3.5 py-[13px] font-mono text-[11px] uppercase leading-none tracking-[0.08em] text-marketing-text min-[900px]:px-5 min-[900px]:py-4">
            <span>Student profile</span>
            <span className="shrink-0 rounded-full border border-dashed border-marketing-hair px-2 py-1 text-[11px] text-marketing-label">
              Illustrative data
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3.5 min-[900px]:gap-2.5 min-[900px]:p-5">
            {studentProfile.fields.map((field) => (
              <div
                key={field.key}
                className={cn(
                  "rounded-[14px] border-[1.25px] border-marketing-hair bg-marketing-surface px-3 py-2.5 min-[900px]:px-3.5 min-[900px]:py-3",
                  field.highlighted && "border-marketing-blue-300",
                )}
              >
                <div
                  className={cn(
                    "font-mono text-[11px] uppercase leading-none tracking-[0.08em] text-marketing-label",
                    field.highlighted && "text-marketing-blue-600",
                  )}
                >
                  {field.key}
                </div>
                <div
                  className={cn(
                    "mt-[7px] font-body text-[13.5px] font-medium leading-[1.25] text-marketing-ink min-[900px]:text-sm",
                    field.highlighted && "text-marketing-blue-700",
                  )}
                >
                  {field.value}
                </div>
              </div>
            ))}
          </div>

          <figcaption className="border-t-[1.25px] border-marketing-hair-soft px-3.5 py-3 font-body text-[13px] leading-[1.5] text-marketing-text min-[900px]:px-5 min-[900px]:py-3.5">
            {studentProfile.caption}
          </figcaption>
        </figure>
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
              <Eyebrow>The problem</Eyebrow>A name and phone number{" "}
              <span className="text-marketing-blue-600">
                aren&apos;t enough
              </span>{" "}
              to start counselling
            </h2>
          </div>

          <div className="max-w-[620px] font-body text-[16px] leading-[1.65] text-marketing-muted min-[900px]:text-[16.5px]">
            <p>
              An enquiry often arrives with a name and a phone number. Country,
              course, intake, marks, budget and test status still have to come
              out before counselling can be useful.
            </p>
            <p className="mt-3">
              A standard form can ask for a currency and a test status directly.
              Free-text still needs a follow-up when the meaning is unclear: a
              budget of &quot;20&quot; does not say the currency or what the
              amount covers, and &quot;not yet&quot; is a status, not a score.
            </p>
          </div>
        </div>

        <div className="mt-10 min-[900px]:mt-12">
          <BeforeAfterScene
            scenario={studyAbroadScenario}
            active
            columns={6}
            valuesLabel="What your counsellor sees"
            ariaLabel="Student budget example: a static form saves “20” as typed, while ConvoForm asks whether that is in INR and what the amount covers, then records “₹20 lakh per year, tuition + living”."
          />
        </div>

        <p className="mt-5 max-w-[820px] font-body text-sm leading-[1.6] text-marketing-text">
          The student types &quot;20&quot;. The follow-up asks whether that is
          in INR and whether the amount covers tuition, living costs, or both.
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
            Keep the fields.{" "}
            <span className="text-marketing-blue-600">Change how you ask</span>{" "}
            for them.
          </h2>
          <p className={cn(leadClass, "mx-auto text-center")}>
            You decide which details matter. ConvoForm asks for them in a
            conversation, and can follow up when an answer is unclear.
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
                    How form creation works <span aria-hidden="true">→</span>
                  </Link>
                </p>
              ) : null}
            </li>
          ))}
        </ol>

        <div className="mt-10 flex justify-center">
          <div className="flex w-full max-w-[400px] flex-col items-stretch min-[900px]:max-w-none min-[900px]:items-center">
            <CreateIntakeLink />
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
          <Eyebrow>The six fields</Eyebrow>
          Collect the six details{" "}
          <span className="text-marketing-blue-600">your first call needs</span>
        </h2>
        <p className={leadClass}>
          This study-abroad example uses six fields. Adjust the descriptions to
          match your consultancy&apos;s process.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border-[1.25px] border-marketing-hair bg-marketing-hair-soft min-[900px]:grid-cols-2 min-[1100px]:grid-cols-3">
          {intakeFields.map((field) => (
            <div
              key={field.id}
              className="min-w-0 bg-marketing-surface p-5 min-[900px]:px-6 min-[900px]:py-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full border-[1.25px] border-marketing-blue-200 bg-marketing-blue-50 px-2.5 py-1.5 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600">
                <FieldIcon id={field.id} />
                {field.detail}
              </span>

              <div className="mt-[18px] font-mono text-[11px] uppercase leading-none tracking-[0.08em] text-marketing-label">
                What to ask for
              </div>
              <div className="mt-[7px] font-display text-[17px] font-semibold leading-[1.35] tracking-[-0.005em] text-marketing-ink">
                {field.ask}
              </div>

              <div className="mt-3 font-mono text-[11px] uppercase leading-none tracking-[0.08em] text-marketing-label">
                Why it helps the counsellor
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

        <p className="mt-[18px] flex max-w-[600px] items-start gap-3 font-body text-[15px] leading-[1.6] text-marketing-muted">
          <InfoIcon className="mt-0.5 text-marketing-blue-600" />A student who
          hasn&apos;t chosen a country or taken IELTS may still be worth
          speaking to. Configure the intake to capture &quot;not decided&quot;
          and &quot;not taken yet&quot; honestly, rather than pushing students
          to invent an answer.
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
              Not included in this intake workflow today
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
            <span className="text-marketing-blue-600">consultancy owners</span>
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
              Give your next counselling call{" "}
              <span className="text-marketing-blue-600">
                a better starting point
              </span>
            </h2>

            <p className="mt-4 max-w-[470px] font-body text-[15.5px] leading-[1.6] text-marketing-muted min-[900px]:text-[17px]">
              Collect the student&apos;s plans and current situation before the
              call. Let your counsellor spend that conversation understanding
              the student, rather than starting from a name and number.
            </p>

            <div className="mt-7 flex flex-col items-stretch gap-3 min-[900px]:flex-row min-[900px]:flex-wrap">
              <CreateIntakeLink />
            </div>

            <p className="mt-5 max-w-[470px] font-mono text-[12.5px] leading-[1.6] tracking-[0.01em] text-marketing-text">
              Start with destination, course, intake, marks, budget and tests.
              Review the form, test a few unclear answers, then share it.
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

export default function StudyAbroadUseCasePage() {
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
