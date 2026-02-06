# Draft: Test Automation for Fahras

## Requirements (confirmed)
- **Goal**: Comprehensive test coverage (all 32 browser scenarios + API tests)
- **Test Types**: E2E browser tests + API integration tests (both equally prioritized)
- **CI/CD**: Local only for now (no GitHub Actions integration initially)
- **Data Strategy**: Use existing seeded data (admin@fahras.edu, sarah.johnson@fahras.edu, ahmed.almansouri@student.fahras.edu, reviewer@fahras.edu)

## Technical Decisions
- **Browser Testing Framework**: Playwright (already installed as devDependency)
- **API Testing**: Playwright's `request` context for API tests
- **Test Runner**: @playwright/test
- **Config File**: playwright.config.ts (to be created)
- **Test Location**: tests/ or e2e/ directory

## Research Findings
- 27 page routes exist - all documented routes verified except `/users` (should be `/access-control`)
- 52 API endpoints exist - all 35 documented endpoints verified + 17 bonus endpoints
- Playwright is installed but no config exists
- No test scripts in package.json
- No existing test files

## Scope Boundaries
- INCLUDE:
  - Update TEST_WORKFLOWS.md with 17 missing API endpoints
  - Create playwright.config.ts
  - Add test scripts to package.json
  - Implement all 32 browser test scenarios
  - Implement API integration tests for all endpoints
  - Fix /users -> /access-control reference in test doc
  
- EXCLUDE:
  - CI/CD integration (deferred)
  - Unit tests (focus on E2E + API)
  - Performance testing
  - Visual regression testing

## Open Questions
- None - all requirements confirmed

## Test Infrastructure Needed
1. playwright.config.ts
2. package.json test scripts: "test", "test:e2e", "test:api"
3. tests/ directory structure:
   - tests/e2e/ - browser tests
   - tests/api/ - API tests
   - tests/fixtures/ - shared fixtures
   - tests/utils/ - helper functions
