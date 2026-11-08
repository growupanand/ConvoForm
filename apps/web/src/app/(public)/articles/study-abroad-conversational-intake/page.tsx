import { BeforeAfterScene } from "@/app/(public)/(landingPage)/_components/beforeAfter";
import { primaryCtaClass } from "@/app/(public)/use-cases/_components/pagePrimitives";
import { useCasesPath } from "@/lib/marketingPaths";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

import {
  article,
  branchingSection,
  chooseSection,
  cta,
  exampleSection,
  followUpSection,
  intakeFields,
  introduction,
  limitationsSection,
  notSection,
  studyAbroadScenario,
} from "./content";

export const metadata: Metadata = {
  title: article.title,
  description: article.description,
  keywords: [...article.keywords],
  authors: [{ name: article.author.name, url: article.author.url }],
  alternates: {
    canonical: article.path,
  },
  twitter: {
    card: "summary_large_image",
    title: article.title,
    description: article.description,
  },
  openGraph: {
    type: "article",
    title: article.title,
    description: article.description,
    url: article.path,
    siteName: "ConvoForm",
    publishedTime: article.publishedAt,
    authors: [article.author.url],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.headline,
  alternativeHeadline: article.title,
  description: article.description,
  datePublished: article.publishedAt,
  dateModified: article.publishedAt,
  author: {
    "@type": "Person",
    name: article.author.name,
    url: article.author.url,
  },
  publisher: {
    "@type": "Organization",
    name: "ConvoForm",
    url: "https://www.convoform.com",
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `https://www.convoform.com${article.path}`,
  },
};

const proseClass =
  "mt-5 font-body text-[16.5px] leading-[1.75] text-marketing-muted min-[900px]:text-[17.5px]";

const secondaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full border-[1.25px] border-marketing-hair bg-marketing-surface px-6 py-[14px] font-body text-[15px] font-semibold leading-none text-marketing-ink transition duration-150 hover:-translate-y-px hover:border-marketing-blue-300 hover:text-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600";

const inlineLinkClass =
  "font-semibold text-marketing-blue-600 underline decoration-marketing-blue-200 underline-offset-4 transition-colors duration-150 hover:text-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600";

function ArticleJsonLd() {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD generated from local article content
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
    />
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600">
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-marketing-blue-600"
      />
      {children}
    </span>
  );
}

function ArticleText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[820px]", className)}>
      {children}
    </div>
  );
}

function Prose({ paragraphs }: { paragraphs: ReadonlyArray<string> }) {
  return (
    <div className={proseClass}>
      {paragraphs.map((paragraph, index) => (
        <p key={paragraph} className={cn(index > 0 && "mt-5")}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function SectionHeading({
  id,
  eyebrow,
  heading,
}: {
  id: string;
  eyebrow: string;
  heading: string;
}) {
  return (
    <ArticleText>
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h2
        id={id}
        className="mt-4 font-display text-[clamp(28px,3.4vw,40px)] font-bold leading-[1.1] tracking-[-0.025em] text-marketing-ink"
      >
        {heading}
      </h2>
    </ArticleText>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="mt-8 border-l-2 border-marketing-blue-600 pl-5 font-display text-[clamp(22px,2.5vw,30px)] font-semibold leading-[1.25] tracking-[-0.02em] text-marketing-ink min-[900px]:mt-10">
      {children}
    </blockquote>
  );
}

function ArticleHeader() {
  return (
    <header className="relative isolate min-w-0 overflow-x-clip px-4 pb-12 pt-10 min-[900px]:pb-16 min-[900px]:pt-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-marketing-dot-grid bg-[length:22px_22px] [mask-image:linear-gradient(to_bottom,#000_20%,transparent_90%)]"
      />

      <div className="mx-auto w-full max-w-[1160px]">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-label"
        >
          <Link
            href={useCasesPath}
            className="rounded-sm transition-colors duration-150 hover:text-marketing-ink"
          >
            Use cases
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={article.links.useCase}
            className="rounded-sm transition-colors duration-150 hover:text-marketing-ink"
          >
            Study abroad
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-marketing-blue-600">Article</span>
        </nav>

        <div className="mt-8 max-w-[980px]">
          <SectionEyebrow>{article.eyebrow}</SectionEyebrow>

          <h1 className="mt-5 font-display text-[clamp(38px,5.6vw,70px)] font-bold leading-[1.02] tracking-[-0.04em] text-marketing-ink">
            {article.headlineLead}{" "}
            <span className="text-marketing-blue-600">
              {article.headlineAccent}
            </span>
          </h1>

          <p className="mt-6 max-w-[720px] font-body text-[17px] leading-[1.65] text-marketing-muted min-[900px]:text-[19px]">
            {article.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-body text-[13.5px] leading-[1.4] text-marketing-text">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-marketing-ink font-mono text-[11px] font-medium leading-none text-white">
              UA
            </span>
            <span>
              By{" "}
              <a
                href={article.author.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="font-medium text-marketing-ink underline decoration-marketing-hair underline-offset-4 transition-colors duration-150 hover:text-marketing-blue-700"
              >
                {article.author.name}
              </a>
            </span>
            <span aria-hidden="true">·</span>
            <span>{article.author.role}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt}>{article.publishedLabel}</time>
            <span aria-hidden="true">·</span>
            <span>{article.readingTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function Introduction() {
  return (
    <ArticleText>
      <p className="font-body text-[19px] leading-[1.65] text-marketing-ink min-[900px]:text-[21px]">
        {introduction.lead}
      </p>

      <Prose paragraphs={introduction.paragraphs} />

      <div className="mt-8 rounded-[18px] border-[1.25px] border-marketing-hair bg-marketing-surface p-5 min-[900px]:p-6">
        <p className="font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-label">
          At a glance
        </p>
        <ul className="mt-4 grid list-none gap-3 p-0">
          {introduction.glance.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 font-body text-[15px] leading-[1.55] text-marketing-muted"
            >
              <span
                aria-hidden="true"
                className="mt-[7px] size-1.5 shrink-0 rounded-full bg-marketing-blue-600"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </ArticleText>
  );
}

function BranchingSection() {
  return (
    <section
      id="scripted-branching"
      aria-labelledby="scripted-branching-heading"
      className="scroll-mt-24"
    >
      <SectionHeading
        id="scripted-branching-heading"
        eyebrow={branchingSection.eyebrow}
        heading={branchingSection.heading}
      />
      <ArticleText>
        <Prose paragraphs={branchingSection.paragraphs} />
        <PullQuote>{branchingSection.pullQuote}</PullQuote>
      </ArticleText>
    </section>
  );
}

function FollowUpSection() {
  return (
    <section
      id="ai-follow-ups"
      aria-labelledby="ai-follow-ups-heading"
      className="scroll-mt-24"
    >
      <SectionHeading
        id="ai-follow-ups-heading"
        eyebrow={followUpSection.eyebrow}
        heading={followUpSection.heading}
      />
      <ArticleText>
        <Prose paragraphs={followUpSection.paragraphs} />
        <p className="mt-5 font-body text-[16.5px] leading-[1.75] text-marketing-muted min-[900px]:text-[17.5px]">
          The mechanics are covered in the{" "}
          <a
            href={article.links.formCreationDocs}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={inlineLinkClass}
          >
            form-creation docs
          </a>
          .
        </p>
        <PullQuote>{followUpSection.pullQuote}</PullQuote>
      </ArticleText>
    </section>
  );
}

function IntakeFieldsTable() {
  return (
    <div className="overflow-hidden rounded-[18px] border-[1.25px] border-marketing-hair bg-marketing-surface">
      <div className="hidden grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)] gap-5 border-b-[1.25px] border-marketing-hair bg-marketing-paper px-5 py-3 font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-label min-[900px]:grid min-[900px]:px-6">
        <span>Field</span>
        <span>What the field asks for</span>
        <span>Example answer</span>
      </div>

      {intakeFields.map((field) => (
        <div
          key={field.id}
          className="grid gap-2 border-b border-marketing-hair-soft px-5 py-4 last:border-b-0 min-[900px]:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)] min-[900px]:items-start min-[900px]:gap-5 min-[900px]:px-6 min-[900px]:py-[18px]"
        >
          <span className="font-mono text-[11px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-marketing-blue-600">
            {field.detail}
          </span>
          <p className="font-body text-[14.5px] leading-[1.55] text-marketing-ink">
            {field.ask}
          </p>
          <p className="font-body text-[14px] leading-[1.55] text-marketing-muted">
            e.g.{" "}
            <span className="font-medium text-marketing-ink">
              {field.example}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}

function ExampleSection() {
  return (
    <section
      id="real-example"
      aria-labelledby="real-example-heading"
      className="scroll-mt-24"
    >
      <SectionHeading
        id="real-example-heading"
        eyebrow={exampleSection.eyebrow}
        heading={exampleSection.heading}
      />
      <ArticleText>
        <Prose paragraphs={exampleSection.paragraphs} />
      </ArticleText>

      <div className="mx-auto mt-8 w-full max-w-[1160px]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10.5px] uppercase leading-[1.4] tracking-[0.08em] text-marketing-label">
            {exampleSection.tableLabel}
          </span>
          <span className="rounded-full border border-dashed border-marketing-hair px-2 py-1 font-mono text-[10.5px] uppercase leading-none tracking-[0.06em] text-marketing-label">
            Same fields as the use case
          </span>
        </div>

        <IntakeFieldsTable />
      </div>

      <div className="mx-auto mt-10 w-full max-w-[1160px] min-[900px]:mt-12">
        <BeforeAfterScene
          scenario={studyAbroadScenario}
          active
          columns={6}
          valuesLabel="What your counsellor sees"
          ariaLabel="Student budget example: a static form saves “20” as typed, while ConvoForm asks whether that is in INR and what the amount covers, then records “₹20 lakh per year, tuition + living”."
        />
      </div>

      <ArticleText className="mt-6">
        <p className="font-body text-[15px] leading-[1.65] text-marketing-muted min-[900px]:text-[15.5px]">
          {exampleSection.sceneCaption}
        </p>
        <p className="mt-3 font-body text-[15px] leading-[1.65] text-marketing-text min-[900px]:text-[15.5px]">
          {exampleSection.sceneNote}
        </p>

        <aside className="mt-7 rounded-[18px] border-[1.25px] border-marketing-blue-200 bg-marketing-blue-50 p-5 min-[900px]:p-6">
          <p className="font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600">
            {exampleSection.callout.label}
          </p>
          <p className="mt-3 font-display text-[clamp(20px,2.4vw,26px)] font-semibold leading-[1.25] tracking-[-0.015em] text-marketing-ink">
            {exampleSection.callout.body}
          </p>
        </aside>
      </ArticleText>
    </section>
  );
}

function NotSection() {
  return (
    <section
      id="scope"
      aria-labelledby="scope-heading"
      className="scroll-mt-24"
    >
      <SectionHeading
        id="scope-heading"
        eyebrow={notSection.eyebrow}
        heading={notSection.heading}
      />
      <ArticleText>
        <Prose paragraphs={notSection.paragraphs} />
      </ArticleText>

      <ul className="mx-auto mt-8 grid w-full max-w-[1160px] list-none grid-cols-1 gap-px overflow-hidden rounded-[20px] border-[1.25px] border-marketing-hair bg-marketing-hair-soft p-0 min-[900px]:grid-cols-2 min-[1100px]:grid-cols-3">
        {notSection.items.map((item) => (
          <li
            key={item.title}
            className="min-w-0 bg-marketing-surface p-5 min-[900px]:p-6"
          >
            <h3 className="font-display text-[17px] font-semibold leading-[1.25] tracking-[-0.01em] text-marketing-ink">
              {item.title}
            </h3>
            <p className="mt-2 font-body text-[14.5px] leading-[1.6] text-marketing-muted">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LimitationsSection() {
  return (
    <section
      id="limitations"
      aria-labelledby="limitations-heading"
      className="scroll-mt-24"
    >
      <SectionHeading
        id="limitations-heading"
        eyebrow={limitationsSection.eyebrow}
        heading={limitationsSection.heading}
      />
      <ArticleText>
        <Prose paragraphs={limitationsSection.paragraphs} />

        <ol className="mt-8 list-none border-t-[1.25px] border-marketing-hair p-0">
          {limitationsSection.items.map((item, index) => (
            <li
              key={item.title}
              className="grid grid-cols-[auto_1fr] gap-4 border-b-[1.25px] border-marketing-hair py-5 min-[900px]:py-6"
            >
              <span
                aria-hidden="true"
                className="pt-1 font-mono text-[11px] font-medium leading-none tracking-[0.08em] text-marketing-blue-600"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-[18px] font-semibold leading-[1.3] tracking-[-0.01em] text-marketing-ink">
                  {item.title}
                </h3>
                <p className="mt-2 font-body text-[15px] leading-[1.65] text-marketing-muted">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </ArticleText>
    </section>
  );
}

function ChooseSection() {
  return (
    <section
      id="choosing"
      aria-labelledby="choosing-heading"
      className="scroll-mt-24"
    >
      <SectionHeading
        id="choosing-heading"
        eyebrow={chooseSection.eyebrow}
        heading={chooseSection.heading}
      />
      <ArticleText>
        <Prose paragraphs={chooseSection.paragraphs} />
      </ArticleText>

      <div className="mx-auto mt-8 grid w-full max-w-[1160px] grid-cols-1 gap-4 min-[900px]:grid-cols-2 min-[900px]:gap-5">
        <div className="rounded-[22px] border-[1.25px] border-marketing-hair bg-marketing-surface p-6 min-[900px]:p-7">
          <h3 className="font-display text-[20px] font-semibold leading-[1.2] tracking-[-0.01em] text-marketing-ink">
            {chooseSection.branching.title}
          </h3>
          <ul className="mt-5 grid list-none gap-3 p-0">
            {chooseSection.branching.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 font-body text-[15px] leading-[1.55] text-marketing-muted"
              >
                <span
                  aria-hidden="true"
                  className="mt-[7px] size-1.5 shrink-0 rounded-sm bg-marketing-slate"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[22px] border-[1.25px] border-marketing-blue-200 bg-marketing-surface p-6 min-[900px]:p-7">
          <h3 className="font-display text-[20px] font-semibold leading-[1.2] tracking-[-0.01em] text-marketing-ink">
            {chooseSection.followUp.title}
          </h3>
          <ul className="mt-5 grid list-none gap-3 p-0">
            {chooseSection.followUp.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 font-body text-[15px] leading-[1.55] text-marketing-muted"
              >
                <span
                  aria-hidden="true"
                  className="mt-[7px] size-1.5 shrink-0 rounded-full bg-marketing-blue-600"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ArticleText className="mt-6">
        <p className="font-body text-[16px] leading-[1.75] text-marketing-muted min-[900px]:text-[16.5px]">
          {chooseSection.closing}
        </p>
      </ArticleText>
    </section>
  );
}

function CtaSection() {
  return (
    <section
      id="try-it"
      aria-labelledby="try-it-heading"
      className="scroll-mt-24"
    >
      <div className="relative isolate overflow-hidden rounded-[26px] border-[1.25px] border-marketing-hair bg-marketing-surface px-6 py-9 min-[900px]:grid min-[900px]:grid-cols-[1.1fr_0.9fr] min-[900px]:items-center min-[900px]:gap-10 min-[900px]:rounded-[32px] min-[900px]:px-12 min-[900px]:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-marketing-dot-grid bg-[length:22px_22px] [mask-image:radial-gradient(ellipse_90%_60%_at_50%_80%,#000_25%,transparent_80%)] min-[900px]:[mask-image:radial-gradient(ellipse_70%_90%_at_72%_50%,#000_25%,transparent_80%)]"
        />

        <div className="min-w-0">
          <SectionEyebrow>{cta.eyebrow}</SectionEyebrow>

          <h2
            id="try-it-heading"
            className="mt-4 max-w-[560px] font-display text-[clamp(30px,4vw,46px)] font-bold leading-[1.05] tracking-[-0.03em] text-marketing-ink"
          >
            {cta.heading}
          </h2>

          <p className="mt-4 max-w-[540px] font-body text-[15.5px] leading-[1.65] text-marketing-muted min-[900px]:text-[16.5px]">
            {cta.body}
          </p>

          <div className="mt-7 flex flex-col items-stretch gap-3 min-[900px]:flex-row min-[900px]:items-center">
            <Link href={article.links.useCase} className={primaryCtaClass}>
              {cta.primaryLabel} <span aria-hidden="true">→</span>
            </Link>
            <Link href={article.links.demo} className={secondaryCtaClass}>
              {cta.secondaryLabel}
            </Link>
          </div>

          <p className="mt-5 max-w-[540px] font-body text-[14px] leading-[1.6] text-marketing-text">
            Read the{" "}
            <a
              href={article.links.docs}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={inlineLinkClass}
            >
              {cta.docsLabel}
            </a>{" "}
            for form creation and field descriptions, or{" "}
            <Link href={article.links.homeDemo} className={inlineLinkClass}>
              {cta.homeDemoLabel}
            </Link>
            . {cta.buildNote}
          </p>
        </div>

        <div className="mt-8 min-w-0 border-t-[1.25px] border-marketing-hair pt-6 min-[900px]:mt-0 min-[900px]:border-l-[1.25px] min-[900px]:border-t-0 min-[900px]:pl-10 min-[900px]:pt-0">
          <p className="font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-label">
            The one-line version
          </p>
          <p className="mt-3 font-display text-[clamp(22px,2.8vw,32px)] font-semibold leading-[1.2] tracking-[-0.025em] text-marketing-ink">
            “{cta.quote}”
          </p>
        </div>
      </div>
    </section>
  );
}

export default function StudyAbroadArticlePage() {
  return (
    <main className="min-w-0">
      <ArticleJsonLd />
      <ArticleHeader />

      <article className="px-4 pb-16 min-[900px]:pb-24">
        <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 gap-16 min-[900px]:gap-24">
          <Introduction />
          <BranchingSection />
          <FollowUpSection />
          <ExampleSection />
          <NotSection />
          <LimitationsSection />
          <ChooseSection />
          <CtaSection />
        </div>
      </article>
    </main>
  );
}
