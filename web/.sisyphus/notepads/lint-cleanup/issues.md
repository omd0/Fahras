# Issues - Lint Cleanup

## Known Problems
- **Lint gate currently broken**: 522 warnings > 500 threshold → `bun run lint` fails
- **Near-zero test coverage**: Only `LoginPage.test.tsx` exists — cannot rely on tests for regression detection
- **Pre-existing TypeScript errors** (OUT OF SCOPE for this plan):
  - `AnalyticsPage.tsx:233` — `Project[]` not assignable to `TopRatedProject[]`
  - `AnalyticsPage.tsx:824` + `FacultyDashboard.tsx:644` — MUI ListItem `button` prop removed in v7
  - `UniversalSearchBox.tsx:347` — Unintentional comparison with `""`

## Gotchas
- Wave 2 risk: Adding fetch function to `useEffect` deps without `useCallback` wrapper → infinite re-renders
- MUI v7 breaking change: `<Grid item>` → `<Grid size={{...}}>`
- ESLint 9 flat config: `--ext` flag deprecated, handled by `files` pattern
- React Compiler: Manual `useMemo` deps must match inferred deps exactly

## Blockers
- None currently

## [2026-02-01 05:56] CRITICAL BLOCKER: Pre-flight Baseline Failed

**Task 0 Result:** FAILED

### TypeScript Compilation Errors
- **79 TypeScript compilation errors** detected (not 3 as initially noted)
- `bunx tsc --noEmit` exits with code 2 (FAIL)
- `bun run build` fails at TypeScript compilation step (exits code 2)

### Error Categories
1. **Missing type declarations**: stylis module
2. **Project type mismatches**: Missing required properties (slug, program_id, created_by_user_id, abstract, approval_status, description, student, department_id)
3. **MUI v7 API breaking changes**: ListItem button prop removed, Skeleton size prop type changed
4. **Virtualization library type issues**: react-window ref types incompatible
5. **Store type issues**: Zustand expandedPaths Set vs array type mismatch
6. **API method missing**: getCurrentUser, getFacultyPendingProjects not defined
7. **Enum/literal type mismatches**: Permission categories, flag severity, language direction

### Root Cause
The codebase has **pre-existing TypeScript errors** that prevent successful compilation. These are OUT OF SCOPE for lint cleanup (which only addresses ESLint warnings, not TypeScript errors).

### Impact
**CANNOT PROCEED WITH LINT CLEANUP** per plan requirements:
> "If any pre-flight check fails, STOP and report. Cannot verify regressions without passing baseline."

Lint cleanup verification strategy relies on:
- `bunx tsc --noEmit` → Must pass to verify no type regressions
- `bun run build` → Must pass to verify production build still works

Without a passing baseline, we cannot distinguish between:
- New errors introduced by lint fixes
- Pre-existing errors

### Recommended Path Forward
**Option 1 (Recommended)**: Fix TypeScript errors FIRST, then run lint cleanup
**Option 2**: Modify plan scope to exclude TypeScript-dependent verification
**Option 3**: Use `tsc --skipLibCheck --noEmit` as baseline (risky - may mask regressions)

**Decision needed from user.**
