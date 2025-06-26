# Bugs & Issues Log

## Standardized Bug & Limitation Tracking

- All bugs and limitations are tracked as checklists for clarity.
- Each entry includes: **Date Found**, **Severity**, **Status**, **Description**, **Root Cause**, **Actions Taken**, **Solution/Fix**, **Next Steps**.
- Fixed items are checked (✅), unresolved are unchecked (⬜).
- Dependency issues are tracked separately for visibility.

---

## 2025-06-24

### 🐞 Active Bugs

#### ⬜ Google API and LangChain Integration Version Conflict
- **Date Found**: 2025-06-24
- **Severity**: High
- **Status**: Unresolved
- **Description**: Integration between `langchain` and `googleapis` fails due to incompatible versions, preventing use of Google API features in LangChain workflows.
- **Root Cause**: `langchain@0.0.200` requires `googleapis@^126.0.1`, but the project uses `googleapis@128.0.0`.
- **Actions Taken**:
  - Attempted to use both packages together; encountered runtime and install errors.
  - Searched for compatible versions and checked changelogs.
- **Next Steps**:
  - Consider downgrading `googleapis` to `^126.0.1` if `langchain` is required.
  - Monitor for updates from either package that resolve the conflict.
  - Test integration after version changes.

#### ⬜ `langgraph` Not Found in npm Registry
- **Date Found**: 2025-06-24
- **Severity**: High
- **Status**: Unresolved
- **Description**: `langgraph@^0.0.20` is not found in the npm registry, blocking installation and usage.
- **Root Cause**: No official npm package; may require private repo or GitHub install.
- **Actions Taken**:
  - Attempted `npm install langgraph@^0.0.20` and received 404 error.
  - Checked npm registry and official docs ([see here](https://langchain-ai.github.io/langgraphjs/)).
- **Next Steps**:
  - Investigate installation via official docs or private repo.
  - If not available, consider removing from dependencies until a public release is available.
  - Update `package.json` accordingly.

---
## 🗂️ Dependency Issues (Unresolved)

#### ⬜ `langgraph` Not Found in npm Registry
- **See above for details.**
- **Update**: Remove 'langgraph' from dependencies in package.json until a public npm release is available. If needed, install from GitHub as per official docs.

#### ⬜ `langchain` and `googleapis` Version Conflict
- **See above for details.**
- **Update**: If 'langchain' integration is required, downgrade 'googleapis' to ^126.0.1 as per langchain requirements.


## ✅ Completed Bugs & Feature Changes

#### Tailwind CSS Not Working Initially
- **Date Found**: 2025-06-24
- **Severity**: High
- **Status**: Fixed
- **Description**: Tailwind CSS styles were not being applied to components, resulting in unstyled UI.
- **Root Cause**: The `globals.css` file containing Tailwind directives was not imported in `layout.tsx`.
- **Actions Taken**:
  - Investigated missing styles in the browser.
  - Checked Tailwind config and build output.
  - Discovered missing import in `layout.tsx`.
- **Solution/Fix**: Created `src/app/globals.css` with Tailwind directives and imported it in `layout.tsx`.
- **Next Steps**: None needed; confirmed working after fix.

#### shadcn/ui Installation Dependencies Conflict
- **Date Found**: 2025-06-24
- **Severity**: Medium
- **Status**: Fixed (workaround)
- **Description**: Unable to install shadcn/ui due to npm peer dependency conflict between `langchain@0.0.200` and `googleapis@128.0.0`.
- **Root Cause**: `langchain` expects `googleapis@^126.0.1`, but the project had `googleapis@128.0.0` installed, causing a version mismatch.
- **Actions Taken**:
  - Attempted `npm install` and received peer dependency errors.
  - Used `npm install --legacy-peer-deps` to bypass, but not ideal.
  - Temporarily uninstalled `googleapis` to allow shadcn/ui installation.
- **Solution/Fix**: Uninstalled `googleapis`, installed shadcn/ui, and noted to reinstall a compatible version later.
- **Next Steps**: Re-install `googleapis` with a compatible version (`^126.0.1`) when needed for integration with `langchain`.

#### Missing `cn` Utility Function
- **Date Found**: 2025-06-24
- **Severity**: Medium
- **Status**: Fixed
- **Description**: shadcn/ui components expect a `cn` utility function in `@/lib/utils`, causing runtime errors if missing.
- **Root Cause**: shadcn/ui CLI does not create the utils file automatically, and the function was not manually added.
- **Actions Taken**:
  - Noticed import errors in components using `cn`.
  - Reviewed shadcn/ui documentation and example projects.
- **Solution/Fix**: Created `src/lib/utils.ts` with a `cn` function using `clsx` and `tailwind-merge`.
- **Next Steps**: None needed; all components now import `cn` successfully.

#### Next.js Chunk Loading Error
- **Date Found**: 2025-06-24
- **Severity**: High
- **Status**: Fixed
- **Description**: ChunkLoadError when loading `app/page.js` after major refactoring, causing the app to fail to load.
- **Root Cause**: Stale build cache after significant file changes.
- **Actions Taken**:
  - Investigated error logs in browser and terminal.
  - Searched for similar issues in Next.js community.
- **Solution/Fix**: Deleted `.next` folder and restarted dev server, which resolved the issue.
- **Next Steps**: None needed; monitor for recurrence after large refactors.

#### Email List Shows Individual Emails Instead of Threads
- **Date Fixed**: 2025-06-24
- **Severity**: Low (Feature Change)
- **Status**: Fixed
- **Description**: Emails were displayed individually rather than grouped by thread. (Feature improvement)
- **Note**: This was a feature change, not a bug.
- **Solution/Fix**: Implemented thread-based data model and UI components.

#### No Visual Feedback for Email Actions
- **Date Fixed**: 2025-06-24
- **Severity**: Low (Feature Change)
- **Status**: Fixed
- **Description**: Approve/reject actions had no visual feedback. (Feature improvement)
- **Note**: This was a feature change, not a bug.
- **Solution/Fix**: Added loading states, animations, and notifications.



---
## 📝 Known Limitations / TODO

### Critical
- [ ] Integrate real email/database (currently using mock data)
  - **Details**: All email data is currently mocked. Need to connect to Supabase and Gmail API for real data.
  - **Guidance**: Review Supabase and Gmail API documentation for integration steps. Use environment variables for credentials.
  - **Next Steps**: Set up Supabase tables and Gmail API integration as per `plan.md`.
- [ ] Implement real email sending (currently simulated)
  - **Details**: Approve action simulates sending but does not actually send emails.
  - **Guidance**: Use Gmail API to send emails from backend. Ensure proper OAuth scopes and user consent.
  - **Next Steps**: Implement backend logic to send emails via Gmail API.
- [ ] Add user authentication
  - **Details**: No authentication is currently implemented. Considering Google Authentication for seamless sign-in.
  - **Guidance**: Use [NextAuth.js](https://next-auth.js.org/) with the Google provider for easy integration with Next.js. Set up Google Cloud OAuth credentials and add to `.env.local`.
  - **Next Steps**: Install NextAuth, configure Google provider, and protect routes/components as needed.
- [ ] Add email search and filtering capabilities
  - **Details**: No way to search or filter emails in the UI. This is essential for usability as email volume grows.
  - **Guidance**: Implement search bar and filter options in the email list component. Consider debounced search and filter by sender/date/status.
  - **Next Steps**: Add search bar and filter options to email list component.
- [ ] Improve task list and email tracking
  - **Details**: Current task tracking is basic. Need to better track emails as tasks and provide actionable task management.
  - **Guidance**: Enhance task model, UI, and workflow for tracking and managing email-derived tasks. Consider linking tasks to email threads.
  - **Next Steps**: Enhance task model, UI, and workflow for tracking and managing email-derived tasks.

### Nice to Have / Future
- [ ] Improve performance for large numbers of emails/threads
  - **Details**: Performance may degrade with large datasets. Optimize queries, pagination, and rendering.
  - **Guidance**: Use pagination/infinite scroll and memoization for large lists.
  - **Next Steps**: Profile and optimize rendering and data fetching.
- [ ] Enhance responsive design for mobile devices
  - **Details**: UI is functional but could be improved for mobile and tablet users.
  - **Guidance**: Use Tailwind responsive utilities and test on multiple devices.
  - **Next Steps**: Refine CSS and layout for mobile breakpoints.
- [ ] Test thread grouping with various email scenarios
  - **Details**: Ensure thread grouping logic works for edge cases and complex conversations.
  - **Guidance**: Create test cases with complex and nested threads.
  - **Next Steps**: Test and refine thread grouping logic.
- [ ] Verify AI reply generation handles edge cases
  - **Details**: AI reply works, but should be tested with unusual or complex email threads.
  - **Guidance**: Test with edge case emails and review AI output for quality.
  - **Next Steps**: Add more test cases for AI reply generation.

---

**Last Updated**: 2025-06-25