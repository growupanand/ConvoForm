import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CommitCategory } from "@convoform/release";

import styles from "./changelogTimeline.module.css";
import { ReleaseNotes } from "./releaseNotes";
import {
  type ReleaseGroup,
  type ReleaseSummary,
  releaseGithubUrl,
} from "./releaseSummary";

const categoryLabels: Record<CommitCategory, string> = {
  features: "Features",
  improvements: "Improvements",
  fixes: "Fixes",
};

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
      <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
    </svg>
  );
}

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
    >
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

function CategoryTags({ counts }: { counts: ReleaseSummary["counts"] }) {
  const categories = (Object.keys(counts) as CommitCategory[]).filter(
    (category) => counts[category] > 0,
  );

  return (
    <div className={styles.tags}>
      {categories.map((category) => (
        <span
          key={category}
          className={cn(
            styles.tag,
            category === "features" && styles.tagFeature,
            category === "fixes" && styles.tagFix,
          )}
        >
          {categoryLabels[category]}
          <i className={styles.tagCount}>×{counts[category]}</i>
        </span>
      ))}
    </div>
  );
}

function CommitGroups({ groups }: { groups: ReleaseGroup[] }) {
  return (
    <div className={styles.commitGroups}>
      {groups.map((group) => (
        <div key={group.category} className={styles.commitGroup}>
          <h3 className={styles.commitHeading}>
            {categoryLabels[group.category]}
            <span className={styles.commitCount}>{group.commits.length}</span>
          </h3>

          <ul className={styles.commitList}>
            {group.commits.map((commit, index) => (
              <li key={`${group.category}-${index}-${commit.href}`}>
                <a
                  href={commit.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.commitLink}
                >
                  {commit.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function ReleaseEntry({
  release,
  latest,
}: {
  release: ReleaseSummary;
  latest: boolean;
}) {
  const versionLabel = `v${release.version}`;
  const commitLabel = `${release.commitCount} ${
    release.commitCount === 1 ? "commit" : "commits"
  }`;

  return (
    <li
      id={release.anchor}
      className={cn(styles.release, latest && styles.latestRelease)}
    >
      <div className={styles.date}>
        <time dateTime={release.isoDate} className={styles.time}>
          {formatDate(release.isoDate)}
        </time>
        {latest ? <span className={styles.latestBadge}>Latest</span> : null}
      </div>

      <span className={styles.dot} aria-hidden="true" />

      <div className={styles.body}>
        <div className={styles.head}>
          <h2 className={styles.version}>
            <a href={`#${release.anchor}`}>{versionLabel}</a>
          </h2>

          <a
            href={`#${release.anchor}`}
            aria-label={`Permalink to version ${release.version}`}
            title={`Copy link to version ${release.version}`}
            className={styles.permalink}
          >
            <LinkIcon />
          </a>
        </div>

        <CategoryTags counts={release.counts} />

        {release.hasNotes ? <ReleaseNotes version={release.version} /> : null}

        <CommitGroups groups={release.groups} />

        <div className={styles.meta}>
          <span>{commitLabel}</span>
          <span className={styles.sep} aria-hidden="true">
            ·
          </span>
          <a
            href={releaseGithubUrl(release.version)}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={styles.github}
          >
            Release on GitHub <ExternalIcon />
          </a>
        </div>
      </div>
    </li>
  );
}

export function OlderReleaseEntry({
  release,
}: {
  release: ReleaseSummary;
}) {
  const versionLabel = `v${release.version}`;
  const commitLabel = `${release.commitCount} ${
    release.commitCount === 1 ? "commit" : "commits"
  }`;

  return (
    <li id={release.anchor} className={styles.olderRelease}>
      <div className={styles.olderHead}>
        <h2 className={styles.olderTitle}>
          <a href={`#${release.anchor}`} className={styles.olderVersion}>
            {versionLabel}
          </a>
        </h2>
        <time dateTime={release.isoDate} className={styles.olderDate}>
          {formatDate(release.isoDate)}
        </time>
        <a
          href={releaseGithubUrl(release.version)}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className={styles.olderReleaseLink}
        >
          {commitLabel} · Release on GitHub
        </a>
      </div>

      {release.hasNotes ? <ReleaseNotes version={release.version} /> : null}

      <CommitGroups groups={release.groups} />
    </li>
  );
}

export function ChangelogTimeline({
  releases,
}: {
  releases: ReleaseSummary[];
}) {
  return (
    <div className={styles.timeline}>
      <div className={styles.line} aria-hidden="true" />
      <div className={styles.lineTail} aria-hidden="true" />

      <ol className={styles.releases}>
        {releases.map((release, index) => (
          <ReleaseEntry
            key={release.version}
            release={release}
            latest={index === 0}
          />
        ))}
      </ol>
    </div>
  );
}
