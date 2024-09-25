/**
 * @type { import('czg').UserConfig['prompt'] }
 */

module.exports = {
    types: [
        { value: "chore", name: "chore:    🤖  Worked on something that is not a feature or a fix, and should not show in release notes", emoji: "🤖" },
        { value: "feat", name: "feat:     🚀  A new feature", emoji: "🚀" },
        { value: "fix", name: "fix:      🐛  A bug fix", emoji: "🐛" },
        { value: "perf", name: "perf:     ⚡️  A code change that improves performance", emoji: "⚡️" },
        { value: "refactor", name: "refactor: 💡  A code change that neither fixes a bug nor adds a feature, but should show in release notes", emoji: "💡" },
        { value: "release", name: "release:  🏹  Create a release commit", emoji: "🏹" },
        { value: "style", name: "style:    💄  Markup, formatting, UI, style changes", emoji: "💄" },
        { value: "ci", name: "ci:       🎡  CI related changes", emoji: "🎡" },
        { value: 'docs', name: 'docs:     📚 Documentation only changes', emoji: '📚' },
    ],
    messages: {
        footer: 'List any ISSUES (e.g Github issue number) by this change. E.g.: 31, 34:\n',
    },
    skipQuestions: ["scope", "breaking"],
    useEmoji: true,
    emojiAlign: 'center',
    issuePrefixes: [{ value: '✅ Closes:' }],
    allowCustomIssuePrefix: false,
    allowEmptyIssuePrefix: false,
    maxSubjectLength: 64,
    minSubjectLength: 3,
}