"use client";

import { formatDate } from "@/lib/utils";
import { type ReactNode, useEffect, useRef, useState } from "react";

import styles from "./changelogTimeline.module.css";

const firstCommitUrl =
  "https://github.com/growupanand/ConvoForm/commit/386b516dc3f86c32113c114592cc22dca7f549c8";

export function OlderReleases({
  anchors,
  firstVersion,
  children,
}: {
  anchors: string[];
  firstVersion?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const detailsRequested = useRef(false);

  useEffect(() => {
    if (detailsRequested.current) return;

    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!hash || !anchors.includes(hash)) return;

    detailsRequested.current = true;
    setOpen(true);

    window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView();
    });
  }, [anchors]);

  if (anchors.length === 0) return null;

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
        {children}

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
