# Contributing to SundayL

Thank you for your interest in contributing to SundayL! We welcome all contributions—code, documentation, bug reports, feature requests, and ideas. This guide will help you get started and ensure a smooth, collaborative process.

---

## Our Values
- **Clarity**: Write code and docs that are easy to understand.
- **Respect**: Treat all contributors with kindness and professionalism.
- **Quality**: Strive for robust, maintainable, and well-tested code.
- **Transparency**: Communicate openly about decisions and changes.
- **Inclusivity**: We welcome contributors from all backgrounds and experience levels.

---

## How to Contribute

### 1. Getting Started
- **Fork the repository** to your own GitHub account.
- **Clone your fork** locally:
  ```bash
  git clone https://github.com/your-username/sundayl.git
  cd sundayl
  ```
- **Create a new branch** for your feature or fix:
  ```bash
  git checkout -b feature/your-feature-name
  ```

### 2. Making Changes
- Follow the [documentation standards](./documentation.md) for all docs.
- Write clear, concise commit messages (see below).
- Add or update tests for your changes.
- Run `npm run lint` and `npm run test` before submitting.
- Update documentation as needed (code, config, or feature changes).

### 3. Submitting a Pull Request (PR)
- Push your branch to your fork:
  ```bash
  git push origin feature/your-feature-name
  ```
- Open a PR against the `main` branch of the main repo.
- Fill out the PR template with:
  - What your change does
  - Why it's needed
  - Any related issues or discussions
  - How to test your change
- Be responsive to feedback and requested changes.

### 4. Issue Reporting & Feature Requests
- Search [existing issues](../../issues) before opening a new one.
- For bugs, include:
  - Steps to reproduce
  - Expected vs. actual behavior
  - Environment details (OS, browser, etc.)
- For feature requests, describe the use case and potential impact.
- Tag issues appropriately (bug, enhancement, question, etc.).

---

## Coding Standards & Best Practices
- **Language**: TypeScript (strict mode enabled)
- **Framework**: Next.js, React, Tailwind CSS, shadcn/ui
- **Linting**: Use ESLint and Prettier (run `npm run lint`)
- **Testing**: Add/maintain unit, integration, and E2E tests
- **Commits**: Use clear, imperative commit messages (e.g., "Fix email parsing bug")
- **Branch Naming**: Use `feature/`, `fix/`, or `chore/` prefixes
- **Documentation**: Update or add docs for any user-facing or developer-facing changes
- **Accessibility**: Follow a11y best practices for UI
- **Security**: Never commit secrets or sensitive data

---

## Code of Conduct
We are committed to a welcoming, harassment-free experience for everyone. By participating, you agree to follow our [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

## Documentation
- All documentation should follow the [standards and templates](./documentation.md).
- Major docs live in the `docs/` folder, organized by topic.
- Add version history and TODOs to major docs.
- Use diagrams (Mermaid, images) where helpful.

---

## Review & Merge Process
- All PRs require at least one review before merging.
- Automated checks (lint, test) must pass.
- Maintainers may request changes or clarifications.
- Squash and merge is preferred for a clean history.

---

## Questions & Community
- Join discussions in GitHub issues or our chat (see README).
- For onboarding help, see `SETUP.md` and `docs/execution/plan.md`.
- Feedback and suggestions are always welcome!

---

**Thank you for helping build the future of AI-powered productivity with SundayL!**
