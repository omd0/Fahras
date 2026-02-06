# Test Automation for Fahras

## TL;DR

> **Quick Summary**: Implement comprehensive test automation for Fahras graduation project archiving system. Set up Playwright infrastructure, update test documentation, and implement all 32 browser scenarios + API integration tests.
> 
> **Deliverables**:
> - Updated `docs/TEST_WORKFLOWS.md` with 17 additional API endpoints
> - `playwright.config.ts` configured for local development
> - Test scripts in `package.json`
> - 32 browser E2E test files covering all documented scenarios
> - API integration test suite for 52 endpoints
> 
> **Estimated Effort**: Large (40+ tasks)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4 → Task 5-10 (smoke tests) → Tasks 11-42 (full suite)

---

## Context

### Original Request
User requested analysis of `docs/TEST_WORKFLOWS.md`, then asked to:
1. Add missing API endpoint tests to the documentation
2. Create Playwright test infrastructure
3. Create work plan for implementing automated tests

### Interview Summary
**Key Discussions**:
- **Automation Goal**: Comprehensive coverage (all 32 browser scenarios + API tests)
- **Test Priority**: E2E browser tests AND API tests equally prioritized
- **CI/CD**: Local only for now (no GitHub Actions)
- **Data Strategy**: Use existing seeded data (admin@fahras.edu, etc.)

**Research Findings**:
- 27 page routes exist - all documented routes verified
- 52 API endpoints exist - 35 documented, 17 undocumented
- Playwright `@playwright/test@^1.58.1` installed but unconfigured
- No test files, config, or scripts exist
- TEST_WORKFLOWS.md is 1722 lines, ~95% accurate

### Metis Review
**Identified Gaps** (addressed):
- **File fixtures missing**: Seed creates file records but MinIO objects don't exist → Noted in plan, file tests marked as "pending fixtures"
- **Auth state strategy**: Start with explicit login per test, optimize later
- **Database reset**: Tests assume fresh `prisma db seed` before first run
- **Session timeout risk**: Long multi-step tests may timeout → Break into smaller tests

---

## Work Objectives

### Core Objective
Implement production-ready test automation for Fahras with comprehensive coverage of all user roles, browser workflows, and API endpoints.

### Concrete Deliverables
- `docs/TEST_WORKFLOWS.md` - Updated with 17 additional API endpoints + fixed /users reference
- `playwright.config.ts` - Local dev configuration
- `package.json` - Test scripts added
- `tests/e2e/*.spec.ts` - 32 browser test files
- `tests/api/*.spec.ts` - API integration tests
- `tests/fixtures/` - Shared auth fixtures and helpers

### Definition of Done
- [ ] `npx playwright test` runs all tests with 0 failures
- [ ] All 32 documented browser scenarios have corresponding test files
- [ ] All 52 API endpoints have test coverage
- [ ] Tests pass with fresh seed data: `npx prisma db seed && npm run test`

### Must Have
- Playwright as the ONLY test framework (no jest/vitest for E2E)
- Chromium browser only (local dev)
- Headed mode by default for debugging
- Single-threaded execution (avoid data conflicts)
- Tests work with seeded data - no manual setup required

### Must NOT Have (Guardrails)
- ❌ Visual regression testing (not requested)
- ❌ Accessibility (a11y) testing beyond documented RTL tests
- ❌ Performance/load testing
- ❌ Multi-browser testing (no Firefox, Safari, WebKit)
- ❌ Test data factories or generators (use seeded data)
- ❌ Mock/stub services (real integration tests)
- ❌ CI/CD integration (deferred)
- ❌ Custom test reporters (use default HTML)
- ❌ Code coverage instrumentation
- ❌ Modifying application code (except adding data-testid if absolutely needed)

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks are verified by the executing agent using Playwright and shell commands.

### Test Decision
- **Infrastructure exists**: NO → Creating from scratch
- **Automated tests**: Tests-after (implementing based on existing documentation)
- **Framework**: Playwright (`@playwright/test`)

### Pre-Flight Checklist (MUST complete before ANY test runs)
```bash
# 1. Start dev environment
docker compose -f docker-compose.dev.yml up -d

# 2. Seed database
npx prisma db seed

# 3. Start dev server
npm run dev

# 4. Install Playwright browsers
npx playwright install chromium

# 5. Verify MinIO (for file tests)
curl -s http://localhost:9000/minio/health/live
```

### Agent-Executed QA (applies to ALL test tasks)

**Verification Tool**: Bash (Playwright CLI)

```
Scenario: Test file executes successfully
  Tool: Bash
  Preconditions: Dev server running on localhost:3000
  Steps:
    1. npx playwright test [test-file] --headed
    2. Assert: Exit code 0
    3. Assert: Output contains "passed"
    4. Assert: No "failed" or "error" in output
  Expected Result: All tests in file pass
  Evidence: stdout captured
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Infrastructure - Start Immediately):
├── Task 1: Update TEST_WORKFLOWS.md (doc fixes)
├── Task 2: Create playwright.config.ts
├── Task 3: Add test scripts to package.json
└── Task 4: Create test directory structure + fixtures

Wave 2 (Smoke Tests - After Wave 1):
├── Task 5: Guest landing page test (8.1)
├── Task 6: Student login test (8.5)
├── Task 7: Faculty login test (8.15)
├── Task 8: Admin login test (8.19)
├── Task 9: Explore search test (8.2)
└── Task 10: Dashboard navigation test (8.7)

Wave 3 (Full Browser Suite - After Wave 2):
├── Tasks 11-17: Guest tests (8.1-8.4, plus new)
├── Tasks 18-27: Student tests (8.5-8.14)
├── Tasks 28-32: Faculty tests (8.15-8.18)
├── Tasks 33-37: Admin tests (8.19-8.25)
├── Tasks 38-39: Reviewer tests (8.26-8.27)
└── Tasks 40-42: Cross-role tests (8.28-8.32)

Wave 4 (API Tests - After Wave 3 or parallel):
└── Tasks 43-48: API integration test suites

Critical Path: Task 1-4 → Tasks 5-10 → Full verification
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 (Update docs) | None | None | 2, 3, 4 |
| 2 (Playwright config) | None | 5-48 | 1, 3, 4 |
| 3 (package.json) | None | 5-48 | 1, 2, 4 |
| 4 (Directory structure) | None | 5-48 | 1, 2, 3 |
| 5-10 (Smoke tests) | 2, 3, 4 | 11-48 | Each other |
| 11-42 (Browser tests) | 5-10 | 43-48 | Grouped by role |
| 43-48 (API tests) | 2, 3, 4 | None | With browser tests |

---

## TODOs

---

### Infrastructure Tasks (Wave 1)

- [x] 1. Update TEST_WORKFLOWS.md with fixes and additions

  **What to do**:
  - Fix `/users` reference to `/access-control` in tests 8.21 and 8.25
  - Add 17 missing API endpoints to Section "API Endpoint Test Matrix":
    - `/api/projects/suggestions` (GET)
    - `/api/projects/admin` (GET)
    - `/api/projects/analytics` (GET)
    - `/api/projects/[slug]/timeline` (GET)
    - `/api/projects/[slug]/followers` (GET)
    - `/api/projects/[slug]/activities` (GET)
    - `/api/tags` (GET)
    - `/api/search-queries` (GET)
    - `/api/saved-searches` (GET, POST)
    - `/api/saved-searches/[id]` (GET, DELETE)
    - `/api/programs` (GET)
    - `/api/faculties` (GET)
    - `/api/departments` (GET)
    - `/api/bookmarks` (GET, POST)
    - `/api/bookmarks/sync` (POST)
    - `/api/roles/[id]` (PUT, DELETE)
    - `/api/admin/users/[id]/toggle-status` (POST)
    - `/api/milestones/[id]/reopen` (POST)
    - `/api/milestones/[id]/due-date` (PUT)
    - `/api/milestone-templates/[id]/reorder` (POST)

  **Must NOT do**:
  - Change test workflow steps or expected results
  - Remove any existing content

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Documentation update task, structured content modification
  - **Skills**: []
    - No special skills needed for markdown editing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `docs/TEST_WORKFLOWS.md:856-924` - Current API Endpoint Test Matrix
  - `src/app/api/` - All 52 route.ts files for endpoint verification

  **Acceptance Criteria**:
  - [ ] `/users` changed to `/access-control` in tests 8.21 and 8.25
  - [ ] 17 new endpoints added to API Endpoint Test Matrix table
  - [ ] Document validates with markdown linter (no broken formatting)

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Document updates are correct
    Tool: Bash (grep)
    Steps:
      1. grep -c "/users" docs/TEST_WORKFLOWS.md → Should be 0 (all replaced)
      2. grep -c "/access-control" docs/TEST_WORKFLOWS.md → Should be > previous count
      3. grep -c "api/bookmarks/sync" docs/TEST_WORKFLOWS.md → Should be 1
      4. grep -c "api/projects/analytics" docs/TEST_WORKFLOWS.md → Should be 1
    Expected Result: All greps return expected counts
    Evidence: stdout captured
  ```

  **Commit**: YES
  - Message: `docs: add 17 missing API endpoints and fix /users reference in TEST_WORKFLOWS.md`
  - Files: `docs/TEST_WORKFLOWS.md`

---

- [x] 2. Create playwright.config.ts

  **What to do**:
  - Create Playwright configuration file with:
    - `testDir`: `./tests`
    - `baseURL`: `http://localhost:3000`
    - `use.browserName`: `chromium`
    - `use.headless`: `false` (headed by default for local dev)
    - `timeout`: `30000` (30s per test)
    - `expect.timeout`: `5000` (5s for assertions)
    - `retries`: `0` (no retries locally)
    - `reporter`: `html`
    - `workers`: `1` (single-threaded to avoid data conflicts)
    - `fullyParallel`: `false`
    - `projects`: Single chromium project

  **Must NOT do**:
  - Add multi-browser support
  - Configure CI-specific settings
  - Add visual comparison settings

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file creation with clear spec
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Tasks 5-48 (all tests)
  - **Blocked By**: None

  **References**:
  - Playwright docs: https://playwright.dev/docs/test-configuration
  - `package.json:40` - Confirms `@playwright/test` version ^1.58.1

  **Acceptance Criteria**:
  - [ ] `playwright.config.ts` exists at project root
  - [ ] Config exports valid PlaywrightTestConfig
  - [ ] `npx playwright test --list` shows 0 tests (no tests yet, but config valid)

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Playwright config is valid
    Tool: Bash
    Steps:
      1. cat playwright.config.ts | head -20 → Shows imports and config
      2. npx playwright test --list 2>&1 → Should NOT show config errors
      3. Assert: Exit code 0 OR "no tests found" message
    Expected Result: Config loads without errors
    Evidence: stdout captured
  ```

  **Commit**: YES (groups with Task 3)
  - Message: `test: add Playwright configuration and test scripts`
  - Files: `playwright.config.ts`, `package.json`

---

- [x] 3. Add test scripts to package.json

  **What to do**:
  - Add scripts to package.json:
    ```json
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:ui": "playwright test --ui",
    "test:api": "playwright test tests/api/",
    "test:e2e": "playwright test tests/e2e/"
    ```

  **Must NOT do**:
  - Modify existing scripts
  - Add jest/vitest scripts
  - Add coverage scripts

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple JSON modification
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Tasks 5-48
  - **Blocked By**: None

  **References**:
  - `package.json:6-12` - Current scripts section

  **Acceptance Criteria**:
  - [ ] `npm run test` command exists and runs Playwright
  - [ ] `npm run test:headed` runs tests in headed mode
  - [ ] `npm run test:debug` runs tests in debug mode
  - [ ] All scripts execute without "script not found" errors

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Test scripts work
    Tool: Bash
    Steps:
      1. npm run test --help 2>&1 → Should show playwright help
      2. npm run test:headed --help 2>&1 → Should show playwright help
      3. grep -c '"test":' package.json → Should be 1
      4. grep -c '"test:e2e":' package.json → Should be 1
    Expected Result: Scripts defined and executable
    Evidence: stdout captured
  ```

  **Commit**: YES (groups with Task 2)

---

- [x] 4. Create test directory structure and fixtures

  **What to do**:
  - Create directory structure:
    ```
    tests/
    ├── e2e/
    │   ├── guest/
    │   ├── student/
    │   ├── faculty/
    │   ├── admin/
    │   ├── reviewer/
    │   └── cross-role/
    ├── api/
    │   ├── auth/
    │   ├── projects/
    │   ├── files/
    │   ├── admin/
    │   ├── notifications/
    │   └── milestones/
    └── fixtures/
        ├── auth.ts          # Authentication helper
        ├── test-data.ts     # Seeded test data constants
        └── helpers.ts       # Common test utilities
    ```
  - Create `tests/fixtures/test-data.ts` with seeded credentials:
    ```typescript
    export const TEST_USERS = {
      admin: { email: 'admin@fahras.edu', password: 'password' },
      faculty: { email: 'sarah.johnson@fahras.edu', password: 'password' },
      student: { email: 'ahmed.almansouri@student.fahras.edu', password: 'password' },
      reviewer: { email: 'reviewer@fahras.edu', password: 'password' }
    };
    ```
  - Create `tests/fixtures/auth.ts` with login helper function

  **Must NOT do**:
  - Create test data generators
  - Create database seeding scripts
  - Add mock implementations

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: File/folder creation with templates
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Tasks 5-48
  - **Blocked By**: None

  **References**:
  - `prisma/seed.ts:230` - Confirms password is 'password' for all test users
  - `docs/TEST_WORKFLOWS.md:26-32` - Test credentials documentation

  **Acceptance Criteria**:
  - [ ] `tests/` directory exists with e2e/, api/, fixtures/ subdirectories
  - [ ] `tests/fixtures/test-data.ts` exports TEST_USERS object
  - [ ] `tests/fixtures/auth.ts` exports login helper function
  - [ ] TypeScript compiles without errors: `npx tsc --noEmit tests/**/*.ts`

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Directory structure is correct
    Tool: Bash
    Steps:
      1. ls -la tests/ → Shows e2e, api, fixtures directories
      2. ls -la tests/e2e/ → Shows role subdirectories
      3. cat tests/fixtures/test-data.ts → Shows TEST_USERS export
      4. npx tsc --noEmit tests/fixtures/*.ts → Compiles without errors
    Expected Result: All directories and files exist, TypeScript valid
    Evidence: stdout captured
  ```

  **Commit**: YES
  - Message: `test: add test directory structure and fixtures`
  - Files: `tests/**/*`

---

### Smoke Tests (Wave 2)

- [ ] 5. Implement Guest Landing Page Test (8.1)

  **What to do**:
  - Create `tests/e2e/guest/landing.spec.ts`
  - Implement test matching TEST_WORKFLOWS.md Section 8.1:
    - Navigate to `/`
    - Verify hero carousel visible
    - Scroll down, verify featured projects
    - Click featured project card, verify navigation
    - Click "Explore" nav button, verify /explore
    - Click "Login"/"Sign In", verify /login

  **Must NOT do**:
  - Add tests beyond what's documented in 8.1
  - Use CSS selectors when role/label selectors work

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Straightforward test implementation from documented steps
  - **Skills**: [`playwright`]
    - `playwright`: Browser automation patterns, Playwright selectors

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6-10)
  - **Blocks**: Tasks 11-17 (Guest suite)
  - **Blocked By**: Tasks 2, 3, 4

  **References**:
  - `docs/TEST_WORKFLOWS.md:937-948` - Test 8.1 specification
  - `src/app/page.tsx` - Landing page implementation

  **Acceptance Criteria**:
  - [ ] Test file exists: `tests/e2e/guest/landing.spec.ts`
  - [ ] Test covers all steps from TEST_WORKFLOWS.md 8.1
  - [ ] `npx playwright test tests/e2e/guest/landing.spec.ts --headed` passes

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Landing page test passes
    Tool: Bash (Playwright)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. npx playwright test tests/e2e/guest/landing.spec.ts --headed
      2. Assert: Exit code 0
      3. Assert: Output contains "1 passed"
    Expected Result: Test passes
    Evidence: stdout + screenshot on failure
  ```

  **Commit**: NO (batch with other smoke tests)

---

- [ ] 6. Implement Student Login Test (8.5)

  **What to do**:
  - Create `tests/e2e/student/login.spec.ts`
  - Implement test matching TEST_WORKFLOWS.md Section 8.5:
    - Navigate to `/login`
    - Verify "Welcome Back" heading
    - Fill email: `ahmed.almansouri@student.fahras.edu`
    - Fill password: `password`
    - Click submit
    - Verify redirect to `/dashboard`
    - Verify "My Projects" or dashboard stats visible

  **Must NOT do**:
  - Test login validation errors (that's test 8.6)
  - Hardcode selectors that may change

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 18-27 (Student suite)
  - **Blocked By**: Tasks 2, 3, 4

  **References**:
  - `docs/TEST_WORKFLOWS.md:1002-1018` - Test 8.5 specification
  - `src/app/login/page.tsx` - Login page implementation
  - `tests/fixtures/test-data.ts` - TEST_USERS.student credentials

  **Acceptance Criteria**:
  - [ ] Test file exists: `tests/e2e/student/login.spec.ts`
  - [ ] Uses TEST_USERS fixture for credentials
  - [ ] `npx playwright test tests/e2e/student/login.spec.ts --headed` passes

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Student login test passes
    Tool: Bash (Playwright)
    Preconditions: Dev server running, student user seeded
    Steps:
      1. npx playwright test tests/e2e/student/login.spec.ts --headed
      2. Assert: Exit code 0
      3. Assert: URL ends with /dashboard after login
    Expected Result: Login succeeds, redirects to dashboard
    Evidence: stdout captured
  ```

  **Commit**: NO (batch with other smoke tests)

---

- [ ] 7. Implement Faculty Login Test (8.15)

  **What to do**:
  - Create `tests/e2e/faculty/login.spec.ts`
  - Implement test matching TEST_WORKFLOWS.md Section 8.15
  - Login as `sarah.johnson@fahras.edu`
  - Verify Faculty Dashboard with "Advisee Projects" content

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 28-32 (Faculty suite)
  - **Blocked By**: Tasks 2, 3, 4

  **References**:
  - `docs/TEST_WORKFLOWS.md:1208-1223` - Test 8.15 specification
  - `tests/fixtures/test-data.ts` - TEST_USERS.faculty credentials

  **Acceptance Criteria**:
  - [ ] Test file exists: `tests/e2e/faculty/login.spec.ts`
  - [ ] `npx playwright test tests/e2e/faculty/login.spec.ts --headed` passes

  **Commit**: NO (batch with other smoke tests)

---

- [ ] 8. Implement Admin Login Test (8.19)

  **What to do**:
  - Create `tests/e2e/admin/login.spec.ts`
  - Implement test matching TEST_WORKFLOWS.md Section 8.19
  - Login as `admin@fahras.edu`
  - Verify Admin Dashboard with "Total Projects", "Pending Approvals"

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 33-37 (Admin suite)
  - **Blocked By**: Tasks 2, 3, 4

  **References**:
  - `docs/TEST_WORKFLOWS.md:1276-1292` - Test 8.19 specification

  **Acceptance Criteria**:
  - [ ] Test file exists: `tests/e2e/admin/login.spec.ts`
  - [ ] `npx playwright test tests/e2e/admin/login.spec.ts --headed` passes

  **Commit**: NO (batch with other smoke tests)

---

- [ ] 9. Implement Explore Search Test (8.2)

  **What to do**:
  - Create `tests/e2e/guest/explore.spec.ts`
  - Implement test matching TEST_WORKFLOWS.md Section 8.2:
    - Navigate to `/explore`
    - Verify search bar and project grid
    - Type search keyword
    - Verify filtered results
    - Click project card, verify navigation to `/pr/{slug}`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: Tasks 2, 3, 4

  **References**:
  - `docs/TEST_WORKFLOWS.md:950-966` - Test 8.2 specification
  - `src/app/explore/page.tsx` - Explore page implementation

  **Acceptance Criteria**:
  - [ ] Test file exists: `tests/e2e/guest/explore.spec.ts`
  - [ ] `npx playwright test tests/e2e/guest/explore.spec.ts --headed` passes

  **Commit**: NO (batch with other smoke tests)

---

- [ ] 10. Implement Student Dashboard Navigation Test (8.7)

  **What to do**:
  - Create `tests/e2e/student/dashboard.spec.ts`
  - Implement test matching TEST_WORKFLOWS.md Section 8.7:
    - Login as student
    - Navigate to `/dashboard`
    - Verify "My Projects" stats visible
    - Click "Create Project" → verify `/pr/create`
    - Click "My Projects" → verify `/student/my-projects`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: Tasks 2, 3, 4

  **References**:
  - `docs/TEST_WORKFLOWS.md:1039-1053` - Test 8.7 specification

  **Acceptance Criteria**:
  - [ ] Test file exists: `tests/e2e/student/dashboard.spec.ts`
  - [ ] `npx playwright test tests/e2e/student/dashboard.spec.ts --headed` passes

  **Commit**: YES
  - Message: `test: add smoke tests for login and navigation (8.1, 8.2, 8.5, 8.7, 8.15, 8.19)`
  - Files: `tests/e2e/**/*.spec.ts`
  - Pre-commit: `npx playwright test tests/e2e/ --reporter=list`

---

### Full Browser Suite - Guest Tests (Wave 3a)

- [ ] 11. Implement Guest Project Detail Test (8.3)

  **What to do**:
  - Create `tests/e2e/guest/project-detail.spec.ts`
  - Navigate to project detail, verify all sections

  **References**: `docs/TEST_WORKFLOWS.md:968-981`

  **Acceptance Criteria**:
  - [ ] `npx playwright test tests/e2e/guest/project-detail.spec.ts` passes

  **Note**: File download test may fail if MinIO fixtures don't exist - mark as `.skip()` if so

---

- [ ] 12. Implement Guest Access Denied Test (8.4)

  **What to do**:
  - Create `tests/e2e/guest/access-denied.spec.ts`
  - Verify redirects for /dashboard, /pr/create, /admin/approvals, /notifications

  **References**: `docs/TEST_WORKFLOWS.md:983-998`

---

### Full Browser Suite - Student Tests (Wave 3b)

- [ ] 13. Implement Student Login Validation Test (8.6)

  **References**: `docs/TEST_WORKFLOWS.md:1020-1037`
  - Empty form validation
  - Invalid email format
  - Wrong credentials error

---

- [ ] 14. Implement Student Create Project Wizard Test (8.8)

  **What to do**:
  - Create `tests/e2e/student/create-project.spec.ts`
  - Test 3-step wizard: Basic Info → Team → Files/Submit
  - Verify project creation as draft

  **References**: `docs/TEST_WORKFLOWS.md:1055-1095`

  **Note**: This creates data - tests must be idempotent or use unique project titles

---

- [ ] 15. Implement Student Edit Project Test (8.9)

  **References**: `docs/TEST_WORKFLOWS.md:1099-1114`

---

- [ ] 16. Implement Student Bookmark Test (8.10)

  **References**: `docs/TEST_WORKFLOWS.md:1116-1135`

---

- [ ] 17. Implement Student Notifications Test (8.11)

  **References**: `docs/TEST_WORKFLOWS.md:1137-1151`

---

- [ ] 18. Implement Student Profile/Settings Test (8.12)

  **References**: `docs/TEST_WORKFLOWS.md:1153-1169`

---

- [ ] 19. Implement Student Language/Theme Toggle Test (8.13)

  **References**: `docs/TEST_WORKFLOWS.md:1171-1189`
  - Switch EN→AR, verify RTL
  - Toggle dark/light theme

---

- [ ] 20. Implement Student Logout Test (8.14)

  **References**: `docs/TEST_WORKFLOWS.md:1191-1204`

---

### Full Browser Suite - Faculty Tests (Wave 3c)

- [ ] 21. Implement Faculty Review Project Test (8.16)

  **References**: `docs/TEST_WORKFLOWS.md:1225-1241`

---

- [ ] 22. Implement Faculty Pending Approvals Test (8.17)

  **References**: `docs/TEST_WORKFLOWS.md:1243-1256`

---

- [ ] 23. Implement Faculty Access Denied Test (8.18)

  **References**: `docs/TEST_WORKFLOWS.md:1258-1272`

---

### Full Browser Suite - Admin Tests (Wave 3d)

- [ ] 24. Implement Admin Approve Project Test (8.20)

  **References**: `docs/TEST_WORKFLOWS.md:1294-1312`

---

- [ ] 25. Implement Admin User Management Test (8.21)

  **What to do**:
  - Navigate to `/access-control` (NOT /users - it doesn't exist)
  - Test user search, create, role assignment

  **References**: `docs/TEST_WORKFLOWS.md:1314-1342`

  **Note**: Test doc says /users but route is /access-control

---

- [ ] 26. Implement Admin Access Control Test (8.22)

  **References**: `docs/TEST_WORKFLOWS.md:1344-1361`

---

- [ ] 27. Implement Admin Milestone Templates Test (8.23)

  **References**: `docs/TEST_WORKFLOWS.md:1363-1382`

---

- [ ] 28. Implement Admin Analytics Test (8.24)

  **References**: `docs/TEST_WORKFLOWS.md:1384-1398`

---

- [ ] 29. Implement Admin Full Navigation Test (8.25)

  **What to do**:
  - Verify admin can access ALL pages
  - Navigate through every major route

  **References**: `docs/TEST_WORKFLOWS.md:1400-1422`

---

### Full Browser Suite - Reviewer Tests (Wave 3e)

- [ ] 30. Implement Reviewer Login and Browse Test (8.26)

  **References**: `docs/TEST_WORKFLOWS.md:1426-1455`

---

- [ ] 31. Implement Reviewer Access Denied Test (8.27)

  **References**: `docs/TEST_WORKFLOWS.md:1457-1473`

---

### Full Browser Suite - Cross-Role Tests (Wave 3f)

- [ ] 32. Implement Full Project Lifecycle E2E Test (8.28)

  **What to do**:
  - Create `tests/e2e/cross-role/project-lifecycle.spec.ts`
  - PHASE 1: Student creates and submits project
  - PHASE 2: Faculty reviews and comments
  - PHASE 3: Admin approves
  - Verify as Guest: project appears in explore

  **References**: `docs/TEST_WORKFLOWS.md:1477-1558`

  **Note**: This is the most comprehensive test - 40+ steps across 3 user sessions

---

- [ ] 33. Implement Bookmark Sync Test (8.29)

  **References**: `docs/TEST_WORKFLOWS.md:1562-1584`

---

- [ ] 34. Implement Error Handling Tests (8.30)

  **References**: `docs/TEST_WORKFLOWS.md:1588-1623`

---

- [ ] 35. Implement Mobile Responsiveness Test (8.31)

  **What to do**:
  - Set viewport to mobile (375x812)
  - Verify hamburger menu, mobile navigation
  - Reset to desktop, compare

  **References**: `docs/TEST_WORKFLOWS.md:1625-1651`

---

- [ ] 36. Implement RTL/Arabic Layout Test (8.32)

  **References**: `docs/TEST_WORKFLOWS.md:1653-1676`

---

### API Integration Tests (Wave 4)

- [ ] 37. Implement Auth API Tests

  **What to do**:
  - Create `tests/api/auth/auth.spec.ts`
  - Test endpoints:
    - POST /api/login (success, invalid credentials)
    - POST /api/register (success, duplicate email)
    - GET /api/user (authenticated, unauthenticated)

  **References**: `docs/TEST_WORKFLOWS.md:858-864`

---

- [ ] 38. Implement Projects API Tests

  **What to do**:
  - Create `tests/api/projects/projects.spec.ts`
  - Test all project CRUD endpoints
  - Test visibility, comments, ratings, follow, bookmark

  **References**: `docs/TEST_WORKFLOWS.md:866-884`

---

- [ ] 39. Implement Files API Tests

  **What to do**:
  - Create `tests/api/files/files.spec.ts`
  - Test download (public, private)
  - Test delete (own, others, admin)

  **References**: `docs/TEST_WORKFLOWS.md:886-891`

  **Note**: Requires MinIO fixtures for download tests

---

- [ ] 40. Implement Admin API Tests

  **What to do**:
  - Create `tests/api/admin/admin.spec.ts`
  - Test user CRUD endpoints
  - Test role assignments
  - Test permission checks (403 for non-admin)

  **References**: `docs/TEST_WORKFLOWS.md:893-903`

---

- [ ] 41. Implement Milestone API Tests

  **What to do**:
  - Create `tests/api/milestones/milestones.spec.ts`
  - Test templates CRUD
  - Test milestone start/complete/reopen

  **References**: `docs/TEST_WORKFLOWS.md:905-913`

---

- [ ] 42. Implement Notification API Tests

  **What to do**:
  - Create `tests/api/notifications/notifications.spec.ts`
  - Test list, unread-count, read, mark-all-read, delete-all

  **References**: `docs/TEST_WORKFLOWS.md:915-923`

---

## Commit Strategy

| After Tasks | Message | Files | Verification |
|-------------|---------|-------|--------------|
| 1 | `docs: add missing API endpoints to TEST_WORKFLOWS.md` | docs/TEST_WORKFLOWS.md | grep validation |
| 2-4 | `test: add Playwright infrastructure and fixtures` | playwright.config.ts, package.json, tests/ | npx playwright test --list |
| 5-10 | `test: add smoke tests for core flows` | tests/e2e/**/*.spec.ts | npx playwright test |
| 11-20 | `test: add Guest and Student browser tests` | tests/e2e/guest/, tests/e2e/student/ | npx playwright test |
| 21-31 | `test: add Faculty, Admin, Reviewer browser tests` | tests/e2e/**/*.spec.ts | npx playwright test |
| 32-36 | `test: add cross-role and accessibility tests` | tests/e2e/cross-role/ | npx playwright test |
| 37-42 | `test: add API integration test suite` | tests/api/**/*.spec.ts | npm run test:api |

---

## Success Criteria

### Verification Commands
```bash
# All tests pass
npx playwright test
# Expected: 42 test files, 0 failures

# Smoke tests pass quickly (<2 minutes)
npx playwright test --grep "@smoke"
# Expected: 6 tests, <2 min runtime

# API tests pass
npm run test:api
# Expected: 6 test files, 0 failures

# Role-specific tests
npx playwright test --grep "@guest"
npx playwright test --grep "@student"
npx playwright test --grep "@faculty"
npx playwright test --grep "@admin"
npx playwright test --grep "@reviewer"
# Expected: Each role suite passes independently
```

### Final Checklist
- [ ] All 32 browser scenarios have test files
- [ ] All 52 API endpoints have test coverage
- [ ] `npm run test` passes with 0 failures
- [ ] Tests run against fresh seed: `npx prisma db seed && npm run test`
- [ ] Documentation updated with 17 missing endpoints
- [ ] No application code modified (except data-testid if needed)
