module.exports = {
  git: {
    commitMessage: "release: changelog for release note v${version}",
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
        ],
      },
    },
  },
  hooks: {
    "before:init": [
      "npx auto-changelog --stdout --commit-limit false -p --template ./templates/changelog-template.hbs --handlebars-setup ./templates/handlebars-setup.js > ./src/lib/data/changelog.ts",
    ],
  },
};
