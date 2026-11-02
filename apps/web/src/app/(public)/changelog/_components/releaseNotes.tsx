import type { ComponentType } from "react";

import {
  generateMDXComponentFileName,
  generateReleaseMDXFileName,
  releaseMDXComponents,
} from "@convoform/release";

import styles from "./changelogTimeline.module.css";

const components = releaseMDXComponents as Record<
  string,
  ComponentType | undefined
>;

function releaseNotesKey(version: string) {
  const fileName = generateReleaseMDXFileName(version);
  return generateMDXComponentFileName(fileName);
}

export function hasReleaseNotes(version: string) {
  return Boolean(components[releaseNotesKey(version)]);
}

export function ReleaseNotes({ version }: { version: string }) {
  const Notes = components[releaseNotesKey(version)];
  if (!Notes) return null;

  return (
    <div className={styles.notesBody}>
      <Notes />
    </div>
  );
}
