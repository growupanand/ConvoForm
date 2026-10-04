# Contributing to ConvoForm

Thank you for your interest in contributing to ConvoForm! We welcome contributions from everyone.

## 🌟 How to Contribute

### 1. Reporting Issues
- Found a bug? Open a [bug report](https://github.com/growupanand/ConvoForm/issues/new?template=bug_report.yml).
- Have a feature request? Open a [feature request](https://github.com/growupanand/ConvoForm/issues/new?template=feature_request.yml).
- Please provide as much detail as possible (screenshots, reproduction steps, etc.).
- Security issues: see [SECURITY.md](SECURITY.md). Do not file them as public issues.


### 2. Development Setup
To set up the project locally, please refer to the **[Quick Start](README.md#%EF%B8%8F-quick-start-local-development)** section in the README.

### 3. Pull Request Process
1. **Fork** the repository and create a new branch for your feature or fix.
   ```bash
   git checkout -b feature/amazing-feature
   ```
2. **Commit** your changes using Conventional Commits.
   ```bash
   pnpm commit
   # or
   git commit -m "feat: add amazing feature"
   ```
3. **Push** to your fork and submit a Pull Request.

### 4. Code Style
- We use **Biome** for linting and formatting.
- Run `pnpm lint` and `pnpm type-check` before submitting (same scripts as the pre-commit hook).
- CI runs `pnpm lint-ci` and `pnpm type-check-ci` (read-only Biome checks). To also type-check every workspace with TypeScript, run `pnpm type-check:turbo`.


### 5. Documentation
- If you are adding a new feature, please update the documentation in `apps/docs`.

## 📜 Code of Conduct
Please be respectful and considerate of everyone in the community by following our [Code of Conduct](CODE_OF_CONDUCT.md). Let's build something great together!

