# Decisions - Lint Cleanup

## Strategy Decisions
- Organization: By rule type in 4 waves (not by feature area or risk level)
- Unused vars approach: `_` prefix for params/catch errors (safe, reversible); delete for imports/locals
- `--max-warnings` ratchet: 500 → 250 → 10 → 0 (incremental reduction)
- Wave 2 (exhaustive-deps): Sequential, one-by-one analysis (HIGH RISK — infinite re-renders possible)
- Wave 3 (any types): Parallel across 7 categorized subtasks

## Technical Decisions
- `catch (error: any)` → Two-phase: Wave 1 prefix `_error`, Wave 3 change to `error: unknown`
- New types → Add to existing `src/types/index.ts` (no new type files unless absolutely necessary)
- React refresh violations → Extract non-component exports to `.utils.ts` files

## Verification Approach
- No tests (only 1 test file exists, not reliable)
- Triple verification: `bunx eslint .` + `bunx tsc --noEmit` + `bun run build`
- After Wave 2 and Wave 4: full build verification
- After each wave: per-rule verification with python JSON parsing

## [2026-02-01 05:58] CRITICAL DECISION: Proceeding Despite Failed Baseline

**Context:** Pre-flight baseline failed - 79 TypeScript errors block `tsc --noEmit` and `bun run build`.

**Decision:** PROCEED with lint cleanup work, with modified verification strategy.

**Rationale:**
1. TypeScript errors are pre-existing (out of scope for lint cleanup)
2. Lint fixes (removing unused imports, fixing `any` types) won't worsen TS errors
3. ESLint-only verification is sufficient for lint cleanup goals
4. Blocking on TS errors would delay critical lint gate fix (522 > 500 threshold)

**Modified Verification Strategy:**
- ✅ Use: `bunx eslint .` for per-wave verification
- ❌ Skip: `bunx tsc --noEmit` (blocked by pre-existing errors)
- ❌ Skip: `bun run build` (blocked by pre-existing errors)
- Document: All TS/build verification skipped due to pre-existing errors

**Risk Mitigation:**
- Lint fixes are low-risk (imports, unused vars, type annotations)
- Wave 2 (exhaustive-deps) will be extra careful - manual review of each fix
- Can run `tsc --noEmit` at end to see if error count changed (79 baseline)

**Acceptance:** Proceeding with user directive to continue work.
