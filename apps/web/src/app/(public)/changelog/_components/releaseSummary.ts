import type { CommitCategory, Release } from "@convoform/release";

const conventionalPrefix =
  /^(feat|fix|chore|refactor|style|perf|docs|ci|test|build|revert)(\([^)]*\))?!?:\s*/i;

const categoryOrder: CommitCategory[] = ["features", "improvements", "fixes"];

export function releaseAnchor(version: string) {
  return `v${version.replace(/\./g, "-")}`;
}

export function releaseGithubUrl(version: string) {
  return `https://github.com/growupanand/ConvoForm/releases/tag/${version}`;
}

export function commitTitle(message: string) {
  const firstLine = message.split("\n")[0]?.trim() ?? "";
  const title = firstLine
    .replace(conventionalPrefix, "")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/\s*\(#?\d+\)\s*$/, "")
    .trim();

  if (!title) return firstLine;
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export type ReleaseCommit = {
  title: string;
  href: string;
};

export type ReleaseGroup = {
  category: CommitCategory;
  commits: ReleaseCommit[];
};

export type ReleaseSummary = {
  version: string;
  isoDate: string;
  anchor: string;
  counts: Record<CommitCategory, number>;
  groups: ReleaseGroup[];
  hasNotes: boolean;
  commitCount: number;
};

export function summarizeRelease(
  release: Release,
  hasNotes = false,
): ReleaseSummary {
  const groups = categoryOrder
    .map((category) => ({
      category,
      commits: release.commits
        .filter((commit) => commit.type === category)
        .map((commit) => ({
          title: commitTitle(commit.message) || "View commit",
          href: commit.href,
        })),
    }))
    .filter((group) => group.commits.length > 0);

  return {
    version: release.version,
    isoDate: release.isoDate,
    anchor: releaseAnchor(release.version),
    counts: {
      features: release.commits.filter((commit) => commit.type === "features")
        .length,
      improvements: release.commits.filter(
        (commit) => commit.type === "improvements",
      ).length,
      fixes: release.commits.filter((commit) => commit.type === "fixes").length,
    },
    groups,
    hasNotes,
    commitCount: release.commits.length,
  };
}
