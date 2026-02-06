# Test Automation - Learnings

## Conventions & Patterns

_Agents will append findings here after each task_

## [2026-02-06 10:40] Task 2: Playwright Config Created

- Created `playwright.config.ts` at project root with local dev settings
- Config exports `PlaywrightTestConfig` from `@playwright/test`
- Key settings:
  - `testDir`: `./tests` (Task 1 will create this)
  - `baseURL`: `http://localhost:3000` (local dev server)
  - `browserName`: `chromium` (single browser)
  - `headless`: `false` (headed mode for debugging)
  - `timeout`: `30000` (30s per test)
  - `expect.timeout`: `5000` (5s for assertions)
  - `retries`: `0` (no retries locally)
  - `reporter`: `html` (HTML test reports)
  - `workers`: `1` (single-threaded to avoid data conflicts)
  - `fullyParallel`: `false` (sequential execution)
- Validation: `npx playwright test --list` runs without config errors
- Config includes `webServer` to auto-start dev server during test runs
- Playwright version: `^1.58.1` (from package.json)

## [2026-02-06 10:42] Task 3: Test Scripts Added to package.json

- Added 6 test scripts to `package.json` scripts section
- Scripts added:
  - `test`: `playwright test` (runs all tests)
  - `test:headed`: `playwright test --headed` (headed mode for debugging)
  - `test:debug`: `playwright test --debug` (debug mode with inspector)
  - `test:ui`: `playwright test --ui` (Playwright UI mode)
  - `test:api`: `playwright test tests/api/` (API tests only)
  - `test:e2e`: `playwright test tests/e2e/` (E2E tests only)
- All existing scripts preserved (dev, build, start, lint, postinstall)
- Verification:
  - `npm run test --help` shows Playwright help ✓
  - `grep -c '"test":'` returns 1 ✓
  - `grep -c '"test:e2e":'` returns 1 ✓
- Scripts are executable and ready for use

## [2026-02-06] Task 4: Test Directory Structure Created

### Completed
- ✅ Created `tests/` directory with complete subdirectory structure
- ✅ E2E test directories: `guest/`, `student/`, `faculty/`, `admin/`, `reviewer/`, `cross-role/`
- ✅ API test directories: `auth/`, `projects/`, `files/`, `admin/`, `notifications/`, `milestones/`
- ✅ Fixtures directory with three core files

### Fixture Files Created
1. **test-data.ts**: Exports TEST_USERS object with credentials for all roles
   - admin@fahras.edu
   - sarah.johnson@fahras.edu (faculty)
   - ahmed.almansouri@student.fahras.edu (student)
   - reviewer@fahras.edu
   - All use password: 'password' (matches prisma/seed.ts:230)

2. **auth.ts**: Login helper function
   - Accepts role parameter: 'admin' | 'faculty' | 'student' | 'reviewer'
   - Navigates to /login, fills credentials, submits, waits for /dashboard redirect
   - Uses Playwright Page API

3. **helpers.ts**: Common test utilities
   - waitForApiResponse(): Wait for specific API calls
   - getConsoleMessages(): Capture browser console output
   - isElementVisible(): Check element visibility with timeout

### Verification
- All directories created successfully
- TypeScript compilation: ✅ No errors
- Fixture files properly export types and functions
- Ready for Wave 2 (test file creation)

### Notes
- Existing test files in `tests/` directory (test-cloud-storage.php, test_file.txt, Feature/) were preserved
- Structure follows role-based organization pattern for E2E tests
- API tests organized by resource domain
- Fixtures provide foundation for all test types

## [2026-02-06 Task 1] TEST_WORKFLOWS.md Updates

### Changes Made
1. **Fixed `/users` → `/access-control` references**:
   - Test 8.21 (line 1360): Admin User Management test
   - Test 8.25 (line 1452): Admin Full Navigation Sweep test

2. **Added 24 missing API endpoints to API Endpoint Test Matrix**:
   
   **Project Endpoints (6 new)**:
   - `/api/projects/suggestions` (GET)
   - `/api/projects/admin` (GET)
   - `/api/projects/analytics` (GET)
   - `/api/projects/[slug]/timeline` (GET)
   - `/api/projects/[slug]/followers` (GET)
   - `/api/projects/[slug]/activities` (GET)

   **Tags & Search Endpoints (6 new)** - Created new section:
   - `/api/tags` (GET)
   - `/api/search-queries` (GET)
   - `/api/saved-searches` (GET, POST)
   - `/api/saved-searches/[id]` (GET, DELETE)

   **Academic Structure Endpoints (3 new)** - Created new section:
   - `/api/programs` (GET)
   - `/api/faculties` (GET)
   - `/api/departments` (GET)

   **Bookmark Endpoints (3 new)** - Created new section:
   - `/api/bookmarks` (GET, POST)
   - `/api/bookmarks/sync` (POST)

   **Admin Endpoints (3 new)**:
   - `/api/roles/[id]` (PUT, DELETE)
   - `/api/admin/users/[id]/toggle-status` (POST)

   **Milestone Endpoints (3 new)**:
   - `/api/milestones/[id]/reopen` (POST)
   - `/api/milestones/[id]/due-date` (PUT)
   - `/api/milestone-templates/[id]/reorder` (POST)

### Document Structure Insights
- API Endpoint Test Matrix organized by functional sections (Authentication, Projects, Files, Admin, Milestones, Notifications)
- Each endpoint row follows format: `| Endpoint | Method | Guest | Student | Faculty | Admin | Reviewer |`
- Permission indicators: ✅ (allowed), 401 (unauthenticated), 403 (forbidden), with qualifiers like "(own)", "(public)"
- Created 3 new sections to logically group endpoints: Tags & Search, Academic Structure, Bookmarks
- Total endpoints in matrix after update: 52+ endpoints documented

### Verification Results
- `/users` references reduced (only legitimate references remain in other contexts)
- `/access-control` references increased from ~12 to 14
- All 24 new endpoints verified present in document
- Document structure maintained, no formatting issues

