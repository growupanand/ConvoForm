import type { Commit, CommitCategory, Release } from "@convoform/release";

const HIGHLIGHT_LIMIT = 5;
const FIX_LIMIT = 6;

const conventionalPrefix =
  /^(feat|fix|chore|refactor|style|perf|docs|ci|test|build|revert)(\([^)]*\))?!?:\s*/i;

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

  if (!title) return "";
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function uniqueTitles(commits: Commit[]) {
  const seen = new Set<string>();
  const titles: string[] = [];

  for (const commit of commits) {
    const title = commitTitle(commit.message);
    if (!title || seen.has(title)) continue;
    seen.add(title);
    titles.push(title);
  }

  return titles;
}

export type ReleaseSummary = {
  version: string;
  isoDate: string;
  anchor: string;
  counts: Record<CommitCategory, number>;
  highlights: string[];
  fixes: string[];
  commitCount: number;
};

export function summarizeRelease(release: Release): ReleaseSummary {
  const byCategory = (category: CommitCategory) =>
    release.commits.filter((commit) => commit.type === category);

  const features = byCategory("features");
  const improvements = byCategory("improvements");
  const fixes = byCategory("fixes");

  const highlights = uniqueTitles([...features, ...improvements]).slice(
    0,
    HIGHLIGHT_LIMIT,
  );
  const fixTitles = uniqueTitles(fixes)
    .map((title) => title.replace(/^fix\s+/i, ""))
    .slice(0, FIX_LIMIT);

  return {
    version: release.version,
    isoDate: release.isoDate,
    anchor: releaseAnchor(release.version),
    counts: {
      features: features.length,
      improvements: improvements.length,
      fixes: fixes.length,
    },
    highlights,
    fixes: fixTitles,
    commitCount: release.commits.length,
  };
}
