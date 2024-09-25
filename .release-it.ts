import type { Config } from "release-it";

export default {
  git: {
    // commitMessage: "release: changelog for release note v${version}",
    commit: false,
    push: false,
    tag: false,
    requireCleanWorkingDir: false,
  },
  github: {
    release: false,
  },
  npm: {
    publish: false,
  },
  plugins: {
    "@release-it/conventional-changelog": {
      infile: "CHANGELOG.md",
      preset: {
        name: "conventionalcommits",
        types: [
          {
            type: "feat",
            section: "Features",
            hidden: false,
          },
          {
            type: "fix",
            section: "Bug Fixes",
            hidden: false,
          },
          {
            type: "revert",
            hidden: true,
          },
          {
            type: "chore",
            hidden: true,
          },
          {
            type: "refactor",
            section: "Improvements",
            hidden: false,
          },
          {
            type: "style",
            section: "Improvements",
            hidden: false,
          },
          {
            type: "perf",
            section: "Improvements",
            hidden: false,
          },
          {
            type: "ci",
            hidden: true,
          },
          {
            type: "docs",
            hidden: true,
          },
        ],
      },
    },
  },
} satisfies Config;
