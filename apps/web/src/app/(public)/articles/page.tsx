import {
  articlesPath,
  jobApplicationArticlePath,
  studyAbroadArticlePath,
  useCasesPath,
} from "@/lib/marketingPaths";
import type { Metadata } from "next";
import Link from "next/link";

import { article as jobApplicationArticle } from "./job-application-conversational-screening/content";
import { article as studyAbroadArticle } from "./study-abroad-conversational-intake/content";

const articlesDescription =
  "Two demonstration-led articles on AI follow-ups and scripted branching, using real ConvoForm use-case examples: study-abroad student intake and job-application screening.";

export const metadata: Metadata = {
  title: "Articles",
  description: articlesDescription,
  alternates: {
    canonical: articlesPath,
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles",
    description: articlesDescription,
  },
  openGraph: {
    title: "Articles",
    description: articlesDescription,
  },
};

const articleCards = [
  {
    kicker: "Study abroad",
    title: studyAbroadArticle.title,
    description: studyAbroadArticle.description,
    publishedAt: studyAbroadArticle.publishedAt,
    publishedLabel: studyAbroadArticle.publishedLabel,
    href: studyAbroadArticlePath,
    linkLabel: "Read the study-abroad article",
  },
  {
    kicker: "Job applications",
    title: jobApplicationArticle.title,
    description: jobApplicationArticle.description,
    publishedAt: jobApplicationArticle.publishedAt,
    publishedLabel: jobApplicationArticle.publishedLabel,
    href: jobApplicationArticlePath,
    linkLabel: "Read the job-application article",
  },
] as const;

const cardClass =
  "group relative isolate flex min-w-0 flex-col overflow-hidden rounded-[22px] border-[1.25px] border-marketing-hair bg-marketing-surface p-6 transition-colors duration-200 hover:border-marketing-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600 min-[900px]:rounded-[26px] min-[900px]:p-9";

export default function ArticlesPage() {
  return (
    <main className="min-w-0">
      <section className="relative isolate min-w-0 overflow-x-clip px-4 pb-10 pt-10 min-[900px]:pb-14 min-[900px]:pt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-marketing-dot-grid bg-[length:22px_22px] [mask-image:linear-gradient(to_bottom,#000_20%,transparent_90%)]"
        />

        <div className="mx-auto w-full max-w-[1160px]">
          <h1 className="max-w-[820px] font-display text-[clamp(36px,5vw,62px)] font-bold leading-[1.04] tracking-[-0.035em] text-marketing-ink">
            <span
              aria-hidden="true"
              className="mb-4 flex items-center gap-2 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600"
            >
              <span className="size-1.5 rounded-full bg-marketing-blue-600" />
              Articles
            </span>
            Notes on forms{" "}
            <span className="text-marketing-blue-600">that talk back</span>
          </h1>

          <p className="mt-[18px] max-w-[620px] font-body text-[16px] leading-[1.6] text-marketing-muted min-[900px]:text-[17px]">
            Each article takes one ConvoForm use case and shows what changes
            when a form can ask a follow-up: what a scripted branch can do, what
            a generated question adds, and where the limits are.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="articles-heading"
        className="min-w-0 px-4 pb-16 pt-2 min-[900px]:pb-24"
      >
        <div className="mx-auto w-full max-w-[1160px]">
          <h2 id="articles-heading" className="sr-only">
            Articles
          </h2>

          <ul className="grid list-none grid-cols-1 gap-5 p-0 min-[900px]:grid-cols-2">
            {articleCards.map((article) => (
              <li
                key={article.href}
                className="min-w-0 max-w-[760px] min-[900px]:max-w-none"
              >
                <Link href={article.href} className={cardClass}>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10 bg-marketing-dot-grid bg-[length:22px_22px] [mask-image:radial-gradient(ellipse_90%_60%_at_50%_80%,#000_25%,transparent_80%)] min-[900px]:[mask-image:radial-gradient(ellipse_70%_90%_at_72%_50%,#000_25%,transparent_80%)]"
                  />

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                    <span className="font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600">
                      {article.kicker}
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-mono text-[11px] leading-none text-marketing-label"
                    >
                      ·
                    </span>
                    <time
                      dateTime={article.publishedAt}
                      className="font-mono text-[11px] leading-none tracking-[0.02em] text-marketing-label"
                    >
                      {article.publishedLabel}
                    </time>
                  </div>

                  <h3 className="mt-4 font-display text-[clamp(24px,2.6vw,32px)] font-semibold leading-[1.12] tracking-[-0.02em] text-marketing-ink">
                    {article.title}
                  </h3>

                  <p className="mt-3 max-w-[540px] font-body text-[15px] leading-[1.6] text-marketing-muted">
                    {article.description}
                  </p>

                  <span className="mt-auto inline-flex items-center gap-2 self-start border-b border-marketing-blue-200 pb-0.5 pt-7 font-body text-sm font-semibold leading-[1.4] text-marketing-blue-600 transition-colors duration-150 group-hover:text-marketing-blue-700">
                    {article.linkLabel} <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-[620px] font-body text-[15px] leading-[1.6] text-marketing-muted">
            Prefer a walkthrough?{" "}
            <Link
              href={useCasesPath}
              className="font-semibold text-marketing-blue-600 underline decoration-marketing-blue-200 underline-offset-4 transition-colors duration-150 hover:text-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600"
            >
              See the use cases
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
