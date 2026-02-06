# Test Automation - Unresolved Problems

## Blockers

_Agents will append unresolved blockers here_

## [2026-02-06T10:40:00] Delegation Interruption Issue

**Problem**: delegate_task() calls are being interrupted/aborted during Wave 2 execution.

**Context**:
- Wave 1 (Tasks 1-4) completed successfully
- Infrastructure in place: playwright.config.ts, test scripts, directory structure
- Dev environment running: Next.js on localhost:3000, DB seeded
- Playwright browsers installed

**Attempted**:
- Task 5 (Guest Landing Page Test) delegation attempted 3 times
- All attempts resulted in "Tool execution aborted" or "interrupted"

**Impact**:
- Cannot proceed with Wave 2 smoke tests (Tasks 5-10)
- Blocking 48 remaining tasks

**Next Steps**:
- Document current state
- Provide status report to user
- May need to implement tests directly or investigate delegation system

## [2026-02-06T11:05:00] Create Project Test Failures

**Problem**: All 3 test cases in create-project.spec.ts failing due to login issues.

**Root Cause**: Login page not loading - #email selector timeout after 10s.

**Evidence**:
- Test 1: TimeoutError waiting for #email on /login
- Test 2: Same timeout on login
- Test 3: Test timeout (30s) exceeded

**Possible Causes**:
1. Dev server not serving /login route properly
2. Login page has different structure than expected
3. NextAuth or auth middleware blocking access
4. Client-side routing issue

**Impact**: Cannot test project creation workflow (Task 14).

**Status**: BLOCKED - Need to investigate login page structure or skip auth-dependent tests.

**Next Action**: Document as blocked, move to next independent task.

## [2026-02-06T11:10:00] API Test Failures - 500 Errors

**Problem**: 6/7 auth API tests failing with HTTP 500 errors.

**Evidence**:
- POST /api/login → 500 (expected 200)
- POST /api/register → 500 (expected 201)  
- GET /api/user → 500 (expected 401 when unauth)
- Only 1 test passed: POST /api/register with unique email

**Root Cause**: API endpoints may not exist or have different structure than documented.

**Next Steps**:
1. Verify API routes exist in src/app/api/
2. Check if Next.js API routes are properly configured
3. Review server logs for actual errors
4. May need to update TEST_WORKFLOWS.md with correct API structure

**Status**: API tests blocked until endpoint investigation complete.
