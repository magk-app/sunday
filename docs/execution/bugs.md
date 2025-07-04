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

**Last Updated**: 2025-06-25