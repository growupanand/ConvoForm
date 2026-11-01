"use client";

import { formatDate } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

import styles from "./changelogTimeline.module.css";
import { releaseGithubUrl } from "./releaseSummary";

const firstCommitUrl =
  "https://github.com/growupanand/ConvoForm/commit/386b516dc3f86c32113c114592cc22dca7f549c8";

export type OlderRelease = {
  version: string;
  isoDate: string;
  anchor: string;
  commitCount: number;
};

export function OlderReleases({ releases }: { releases: OlderRelease[] }) {
  const [open, setOpen] = useState(false);
  const detailsRequested = useRef(false);

  useEffect(() => {
    if (detailsRequested.current) return;

    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!hash || !releases.some((release) => release.anchor === hash)) return;

    detailsRequested.current = true;
    setOpen(true);

    window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView();
    });
  }, [releases]);

  if (releases.length === 0) return null;

  const firstVersion = releases[0]?.version;

  return (
    <div className={styles.older}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="older-releases"
        onClick={() => setOpen((value) => !value)}
        className={styles.olderToggle}
      >
        {open ? "Hide older releases" : "Load older releases"}
        <span>{firstVersion} → first commit</span>
      </button>

      <ol id="older-releases" className={styles.olderList} hidden={!open}>
        {releases.map((release) => (
          <li key={release.version} id={release.anchor}>
            <a
              href={releaseGithubUrl(release.version)}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={styles.olderRow}
            >
              <span className={styles.olderVersion}>v{release.version}</span>
              <time dateTime={release.isoDate} className={styles.olderDate}>
                {formatDate(release.isoDate)}
              </time>
              <span className={styles.olderMeta}>
                {release.commitCount}{" "}
                {release.commitCount === 1 ? "commit" : "commits"}
              </span>
            </a>
          </li>
        ))}

        <li className={styles.firstCommit}>
          <a
            href={firstCommitUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={styles.olderRow}
          >
            <span className={styles.olderVersion}>Let&apos;s Go!</span>
            <time dateTime="2023-11-23" className={styles.olderDate}>
              {formatDate("2023-11-23")}
            </time>
            <span className={styles.olderMeta}>First commit</span>
          </a>
        </li>
      </ol>
    </div>
  );
}
