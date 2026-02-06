# Test Automation - Architectural Decisions

## Key Decisions

_Agents will append architectural choices here_

## [2026-02-06T10:58:00] User Decision: Skip Smoke Tests

**Context**: Landing page test failing with navigation timeout to /explore.

**Decision**: Skip Wave 2 smoke tests (Tasks 5-10) and proceed directly to Create Projects test.

**Reason**: User priority is testing project creation functionality, not navigation flows.

**Deferred Tasks**:
- Task 5: Guest Landing Page Test
- Task 6: Student Login Test  
- Task 7: Faculty Login Test
- Task 8: Admin Login Test
- Task 9: Explore Search Test
- Task 10: Dashboard Navigation Test

**Proceeding to**: Task 14 - Student Create Project Wizard Test (8.8)

## [2026-02-06T11:06:00] Decision: Mark Task 14 as Blocked

**Task**: Student Create Project Wizard Test (8.8)

**Status**: BLOCKED - Login functionality not working in test environment

**Reason**: 
- Login helper fails to find #email field
- All 3 test cases timeout waiting for login page
- Cannot proceed with auth-dependent tests

**Action**: 
- Mark task as blocked in plan
- Document issue in problems.md
- Continue with non-auth tests or API tests

**Deferred**: Will revisit after fixing auth infrastructure or implementing mock auth.
