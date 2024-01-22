module.exports = {
  questions: ["type", "subject", "body", "issues"],
  list: ["feat", "fix", "chore", "refactor", "style", "perf", "release"],
  types: {
    chore: {
      description:
        "Worked on something than is not a feature or a fix, and should not show in release notes",
      emoji: "🤖",
      value: "chore",
    },
    feat: {
      description: "A new feature",
      emoji: "🎸",
      value: "feat",
    },
    fix: {
      description: "A bug fix",
      emoji: "🐛",
      value: "fix",
    },
    perf: {
      description: "A code change that improves performance",
      emoji: "⚡️",
      value: "perf",
    },
    refactor: {
      description:
        "A code change that neither fixes a bug or adds a feature, but should show in release notes",
      emoji: "💡",
      value: "refactor",
    },
    release: {
      description: "Create a release commit",
      emoji: "🏹",
      value: "release",
    },
    style: {
      description: "Markup, formatting, UI, style changes",
      emoji: "💄",
      value: "style",
    },
    messages: {
      type: "Select the type of change that you're committing:",
      subject: "Write a short, imperative mood description of the change:\n",
      body: "Provide a longer description of the change:\n ",
      footer: "Issues this commit closes, e.g #123:",
    },
  },
};
