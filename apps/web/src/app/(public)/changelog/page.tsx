import { releaseSchema, releases } from "@convoform/release";
import type { Metadata } from "next";
import Link from "next/link";

import {
  ChangelogTimeline,
  OlderReleaseEntry,
} from "./_components/changelogTimeline";
import { OlderReleases } from "./_components/loadOlderReleases";
import { hasReleaseNotes } from "./_components/releaseNotes";
import { summarizeRelease } from "./_components/releaseSummary";

const changelogDescription =
  "Product updates and new features in ConvoForm, release by release.";

export const metadata: Metadata = {
  title: "Changelog",
  description: changelogDescription,
  alternates: {
    canonical: "/changelog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Changelog",
    description: changelogDescription,
  },
  openGraph: {
    title: "Changelog",
    description: changelogDescription,
  },
};

const LATEST_RELEASE_COUNT = 8;

const secondaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full border-[1.25px] border-marketing-hair bg-marketing-surface/70 px-4 py-[10px] font-body text-sm font-semibold leading-none text-marketing-ink transition duration-150 hover:-translate-y-px hover:border-marketing-slate focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600";

const primaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-marketing-blue-600 px-4 py-[10px] font-body text-sm font-semibold leading-none text-white shadow-marketing-primary transition duration-150 hover:-translate-y-px hover:bg-marketing-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-blue-600";

function ExternalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-3.5"
    >
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

function getReleases() {
  const parsed = releaseSchema.array().safeParse(releases);
  return parsed.success ? parsed.data : [];
}

export default function ChangelogPage() {
  const parsedReleases = getReleases().filter(
    (release) => release.commits.length > 0 || hasReleaseNotes(release.version),
  );
  const latestReleases = parsedReleases
    .slice(0, LATEST_RELEASE_COUNT)
    .map((release) =>
      summarizeRelease(release, hasReleaseNotes(release.version)),
    );

  const olderReleases = parsedReleases
    .slice(LATEST_RELEASE_COUNT)
    .map((release) =>
      summarizeRelease(release, hasReleaseNotes(release.version)),
    );

  return (
    <main className="min-w-0">
      <section className="relative isolate min-w-0 overflow-x-clip px-4 pb-8 pt-10 min-[900px]:pt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-marketing-dot-grid bg-[length:22px_22px] [mask-image:linear-gradient(to_bottom,#000_20%,transparent_90%)]"
        />

        <div className="mx-auto flex w-full max-w-[980px] flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-marketing-blue-600">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-marketing-blue-600"
              />
              Product updates
            </span>

            <h1 className="mt-3 font-display text-[clamp(36px,5vw,62px)] font-bold leading-[1.04] tracking-[-0.035em] text-marketing-ink">
              Changelog
            </h1>

            <p className="mt-3.5 max-w-[620px] font-body text-[16px] leading-[1.6] text-marketing-muted min-[900px]:text-[17px]">
              Product updates and new features
            </p>
          </div>

          <div className="flex w-full flex-wrap gap-2.5 min-[900px]:w-auto">
            <Link
              href="https://github.com/growupanand/ConvoForm/releases"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={secondaryCtaClass}
            >
              GitHub releases <ExternalIcon />
            </Link>
            <Link
              href="https://convoform.canny.io/feature-requests"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={secondaryCtaClass}
            >
              Suggest a feature <ExternalIcon />
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-label="Release history"
        className="min-w-0 px-4 pb-20 pt-2 min-[900px]:pb-24"
      >
        <div className="mx-auto w-full max-w-[980px]">
          <ChangelogTimeline releases={latestReleases} />

          <OlderReleases
            anchors={olderReleases.map((release) => release.anchor)}
            firstVersion={olderReleases[0]?.version}
          >
            {olderReleases.map((release) => (
              <OlderReleaseEntry key={release.version} release={release} />
            ))}
          </OlderReleases>

          <div className="mx-auto mt-16 max-w-[980px] rounded-[22px] border-[1.25px] border-marketing-hair bg-marketing-surface px-5 py-[22px] min-[900px]:flex min-[900px]:items-center min-[900px]:justify-between min-[900px]:gap-5 min-[900px]:px-7 min-[900px]:py-[26px]">
            <div>
              <h2 className="font-display text-[20px] font-semibold leading-[1.2] text-marketing-ink">
                Your voice matters
              </h2>
              <p className="mt-1.5 font-body text-[15px] leading-[1.55] text-marketing-muted">
                Have an idea that would make our product better? We&apos;re all
                ears!
              </p>
            </div>
            <Link
              href="https://convoform.canny.io/feature-requests"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={`${primaryCtaClass} mt-5 w-full min-[900px]:mt-0 min-[900px]:w-auto`}
            >
              Suggest a feature
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
