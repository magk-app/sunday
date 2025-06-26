# Changelog
## [0.3.0] – Real Data Integration (2024-06-26)

## [0.2.4] - IN PROGRESS (Knowledge Base and Bug Fixes)

## [0.2.0] – First Major Sprint (2024-06-25)
### Features
- **Email List (Threaded):**
  - Displays emails grouped by conversation thread, showing subject, participants, message count, and last message time.
  - Each thread displays status tags (pending, approved, rejected), importance indicator (urgent, high, medium, low), and AI summary badge if present.
  - Threads can be marked as important (starred) and filtered by folder (Inbox, Important, Approved, Rejected).
- **Tinder View:**
  - Card-based interface for triaging emails one at a time.
  - Supports swipe gestures and manual buttons for Approve, Reject, Edit, and Save to Knowledge Base.
  - Progress indicator shows how many emails are left to review.
  - Approve action marks the thread as approved and the draft as sent; Reject deletes the draft and marks the thread as rejected.
  - Edit allows inline editing of the draft reply.
  - Save to Knowledge Base stores the thread/person/project in local storage.
- **AI Draft Reply Generation:**
  - Generates AI-powered draft replies for selected threads using OpenAI API (mocked for now).
  - Tracks token usage and cost, displaying them in the Settings page.
- **Status Bar & Notifications:**
  - Shows current workflow step and status (e.g., Reviewing, Approved, Rejected).
  - Displays toasts for actions (approve/reject, save to KB, errors).
- **Knowledge Base:**
  - Sidebar and dedicated page for viewing people and projects extracted from emails (mocked data).
  - Modal popups for person/project details.
  - Allows manual addition of people/projects to the knowledge base (local storage only).
- **Settings Page:**
  - Profile management (name, email, avatar URL) saved to local storage.
  - OpenAI API key management (local storage only).
  - Usage analytics: total tokens, estimated cost, and discounted cost (50% Sunday Surfaces discount).
- **UI/UX Improvements:**
  - Modern, responsive design using Tailwind CSS and shadcn/ui components.
  - Sidebar navigation for folders.
  - Improved card/list layouts, avatars, and badges.
  - Loading states and visual feedback for actions.

### Bug Fixes
- Fixed Tailwind CSS not loading due to missing import in layout.tsx.
- Resolved shadcn/ui installation dependency conflicts by temporarily removing incompatible packages.
- Added missing `cn` utility function to prevent runtime errors in shadcn/ui components.
- Fixed Next.js chunk loading errors by clearing the build cache after refactor.
- Implemented thread-based grouping to prevent individual emails from showing separately.
- Added visual feedback (toasts, loading states) for approve/reject actions.
- Fixed synchronization issues between Tinder View and main app by listening to localStorage events.
- Improved token usage and cost tracking for AI reply generation and improvements.

### Limitations
- All data is currently mocked; no real database or Gmail API integration yet.
- Knowledge base and settings are local-only (no backend persistence).
- Approve/Reject actions only update local state; no real email sending or archiving.

---

## [0.1.0] – Project Foundation (2024-06-20)
### Features
- **Project Initialization:**
  - Set up Next.js app with TypeScript.
  - Configured Tailwind CSS and shadcn/ui for UI development.
  - Established project structure: `/src/app`, `/components`, `/lib`, `/types`, `/mock`.
- **Documentation:**
  - Created comprehensive README with project vision, stack, and setup instructions.
  - Added development plan (`docs/execution/plan.md`), UI spec (`docs/ui-spec.md`), and bug log (`docs/execution/bugs.md`).
- **Basic UI Scaffolding:**
  - Implemented main layout with header, sidebar, and navigation.
  - Added placeholder pages for Email List, Tinder View, Knowledge Base, and Settings.
  - Populated mock data for emails, threads, people, and projects.

### Bug Fixes
- N/A (initial version, focus on setup and scaffolding).

### Limitations
- No real data or backend integration; all features are mock/stubbed.
- No authentication or persistent storage beyond local mocks.

---

**See `docs/design/0.1.0.md` and `docs/design/0.2.0.md` for detailed design notes.**
