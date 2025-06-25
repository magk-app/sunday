# Bugs & Issues Log

## 2024-06-24

### 1. Dependency Installation Errors
- **langgraph@^0.0.20** is not found in the npm registry. Installation fails with:
  - `npm error 404 Not Found - GET https://registry.npmjs.org/langgraph - Not found`
- **Dependency conflict** between `langchain@0.0.200` and `googleapis@128.0.0`:
  - `langchain` expects `googleapis@^126.0.1`, but the project uses `googleapis@128.0.0`.
  - Resolved by using `--legacy-peer-deps`, but langgraph is still missing.

#### Actions Taken
- Attempted `npm install` and `npm install --legacy-peer-deps`.
- langgraph is not available on npm; need to check for correct package name, alternative source, or remove from dependencies until available.

#### Next Steps
- Investigate correct installation method for `langgraph` (private repo, GitHub, or alternative package?).
- Consider downgrading `googleapis` to `^126.0.1` if `langchain` is required.
- Update dependencies in `package.json` accordingly.

# Bug Tracking & Known Issues

## Active Bugs

### 1. Tailwind CSS Not Working Initially
- **Date Found**: 2024-12-25
- **Severity**: High
- **Status**: ✅ Fixed
- **Description**: Tailwind CSS styles were not being applied to components
- **Root Cause**: Missing `globals.css` import in `layout.tsx`
- **Solution**: Created `src/app/globals.css` with Tailwind directives and imported it in `layout.tsx`

### 2. shadcn/ui Installation Dependencies Conflict
- **Date Found**: 2024-12-25
- **Severity**: Medium
- **Status**: ✅ Fixed (workaround)
- **Description**: npm peer dependency conflict between `langchain@0.0.200` and `googleapis@128.0.0`
- **Root Cause**: langchain requires googleapis@^126.0.1 but project had googleapis@128.0.0
- **Solution**: Temporarily uninstalled googleapis to allow shadcn/ui installation
- **TODO**: Re-install googleapis with compatible version when needed

### 3. Missing `cn` Utility Function
- **Date Found**: 2024-12-25
- **Severity**: Medium
- **Status**: ✅ Fixed
- **Description**: shadcn/ui components expect `@/lib/utils` with `cn` function
- **Root Cause**: shadcn/ui CLI doesn't create the utils file automatically
- **Solution**: Created `src/lib/utils.ts` with `cn` function using `clsx` and `tailwind-merge`

### 4. Next.js Chunk Loading Error
- **Date Found**: 2024-12-25
- **Severity**: High
- **Status**: 🟡 Pending
- **Description**: ChunkLoadError when loading app/page.js after major refactoring
- **Root Cause**: Likely stale build cache after significant file changes
- **Solution**: Delete `.next` folder and restart dev server

## Fixed Bugs Archive

### Email List Shows Individual Emails Instead of Threads
- **Date Fixed**: 2024-12-25
- **Description**: Emails were displayed individually rather than grouped by thread
- **Solution**: Implemented thread-based data model and UI components

### No Visual Feedback for Email Actions
- **Date Fixed**: 2024-12-25
- **Description**: Approve/reject actions had no visual feedback
- **Solution**: Added loading states, animations, and notifications

## Known Limitations

1. **Mock Data Only**: Currently using mock data instead of real email/database integration
2. **No Real Email Sending**: Approve action simulates sending but doesn't actually send emails
3. **Limited AI Integration**: AI reply generation is mocked, not using real OpenAI API
4. **No Authentication**: User authentication not yet implemented
5. **No Search/Filter**: Email search and filtering capabilities not implemented

## Testing Notes

- Test thread grouping with various email scenarios
- Verify AI reply generation handles edge cases
- Check responsive design on mobile devices
- Test with large numbers of emails/threads for performance

---

**Last Updated**: 2024-12-25 