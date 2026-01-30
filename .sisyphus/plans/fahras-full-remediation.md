# Fahras Full UI/UX Remediation + Complete Testing

## TL;DR

> **Quick Summary**: Fix all 52+ UI/UX issues found in the testing report, migrate 462+ hardcoded colors to a new unified design system, and complete Playwright testing of 17 remaining authenticated pages.
> 
> **Deliverables**:
> - New unified MUI theme replacing 2 theme systems + 462+ hardcoded colors
> - All 52+ UI/UX issues fixed (Critical through Low)
> - Placeholder ToS and Privacy Policy pages
> - Vitest test infrastructure configured and working
> - Playwright test suite for all 17 authenticated pages
> - Zero WCAG AA contrast violations on all pages
> 
> **Estimated Effort**: XL (large-scale remediation)
> **Parallel Execution**: YES — 6 waves, with up to 11 parallel tasks in Wave 3
> **Critical Path**: T1 → T3 → T4 → T5 → T7-T16 (color migration) → T17 → T18-T20 → T22

---

## Context

### Original Request
Fix ALL 52+ UI/UX issues from the testing report, complete testing of 17 remaining authenticated pages, and create a new design system. No exclusions — every severity level addressed.

### Interview Summary
**Key Discussions**:
- **Design system**: User chose to replace the existing theme with a brand-new design system (fresh implementation preserving TVTC brand identity)
- **Hardcoded colors**: User chose full migration of all 462+ hardcoded hex values across 29 files
- **Theme unification**: User chose to merge two competing theme systems (MUI + custom DashboardTheme) into a single MUI theme
- **Dark mode**: User chose to drop dark mode for now (light mode only) — significantly reduces scope
- **Test framework**: Vitest (not Jest) — correct choice for Vite project
- **Dead code**: Delete professorTheme.ts and guestTheme.ts, migrate one import
- **Brand palette**: Create new cohesive palette inspired by TVTC but with more variety
- **Legal pages**: Placeholder content for Terms of Service and Privacy Policy
- **Execution order**: Fix all known issues first, then test remaining pages
- **Testing**: Playwright browser automation for authenticated page testing

### Research Findings
- **31 pages total**: 11 public, 8 protected, 12 role-protected
- **35+ shared components** across layout, shared, explore, student, skeleton categories
- **Two theme systems running simultaneously**: tvtcTheme.ts (MUI) + dashboardThemes.ts (custom)
- **462+ hardcoded hex colors** across 29 feature files outside any theme system
- **tvtcTheme.ts has TypeScript bugs**: references undefined properties (primaryLight, primaryDark, backgroundLight)
- **Auth system works correctly**: previous "broken auth" was testing methodology issue
- **9 test users seeded**: admin, 3 faculty, 4 students, 1 reviewer (all password: "password")
- **Test infra non-functional**: npm test fails, no jest.config, no test scripts
- **Existing a11y utilities**: accessibility.ts (222 lines) + accessibility.css (153 lines) — good foundation

### Metis Review
**Identified Gaps** (all addressed):
- **462+ hardcoded colors** not covered by theme replacement → included in scope (full migration)
- **Two `useTheme()` hooks confusing components** → unified into single MUI theme
- **tvtcTheme.ts has undefined property bugs** → verified in pre-flight, fixed in new theme
- **Vitest vs Jest decision** → Vitest chosen (correct for Vite)
- **Dead theme files** → deletion included
- **Brand enforcement scope unclear** → new cohesive palette, TVTC-inspired
- **Dark mode partially supported** → dropped entirely for now
- **Build may be broken** → pre-flight verification as Task 1

---

## Work Objectives

### Core Objective
Bring Fahras to production-ready UI quality by creating a unified design system, fixing all identified issues, migrating all hardcoded colors, and completing comprehensive page testing.

### Concrete Deliverables
- `web/src/styles/theme/fahrasTheme.ts` — New unified MUI theme (replacing tvtcTheme.ts + dashboardThemes.ts)
- `web/src/styles/theme/colorPalette.ts` — New TVTC-inspired cohesive color palette with typed tokens
- Placeholder pages: `/terms` (ToS) and `/privacy` (Privacy Policy) with routes and footer links
- `web/vitest.config.ts` — Vitest configuration
- Updated `web/package.json` with test scripts
- 29+ modified feature files with hardcoded colors replaced by theme tokens
- 5 page components with all reported UI/UX issues fixed
- Playwright test files for 17 authenticated pages with screenshots
- All shared components updated to use new theme

### Definition of Done
- [ ] `docker compose exec node npm run build` passes with zero errors
- [ ] `docker compose exec node npm run lint` passes with zero errors
- [ ] `docker compose exec node npm run test` passes (Vitest smoke test)
- [ ] Zero hardcoded hex colors in `.tsx` files (verified via ast_grep_search)
- [ ] All 31 pages render without console errors
- [ ] WCAG AA contrast ratios met for all text (4.5:1 normal, 3:1 large)
- [ ] ToS and Privacy pages accessible from footer
- [ ] Playwright screenshots captured for all 17 authenticated pages

### Must Have
- Unified theme consumed by ALL components (no component uses old theme or raw hex)
- Proper `<label>` elements on all form fields (not placeholder-as-label)
- Password visibility toggle on all password fields
- Touch targets minimum 44px on all interactive elements
- RTL support preserved (Emotion cache + stylis-plugin-rtl)
- All icon-only buttons have aria-labels

### Must NOT Have (Guardrails)
- NO dark mode support (explicitly dropped — remove toggle if present)
- NO changes to API/backend code (frontend-only work)
- NO imports from professorTheme.ts or guestTheme.ts in new code
- NO new features beyond fixing reported issues
- NO component restructuring while fixing visual issues
- NO scope expansion during testing phase (document only, fix separately)
- NO AI slop: no excessive comments, no over-abstraction, no gratuitous error handling beyond what exists
- NO "user manually verifies" acceptance criteria — all automated

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (broken — needs setup)
- **User wants tests**: YES — Vitest for unit tests, Playwright for browser tests
- **Framework**: Vitest (native Vite integration)

### Vitest Setup (Task 2)
Install and configure before any other work:
```bash
docker compose exec node npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```
Configure in `vitest.config.ts`, add scripts to `package.json`.

### Playwright for Page Testing (Tasks 17-20)
Browser automation to test all authenticated pages:
- Login with seeded credentials
- Navigate to each route
- Capture screenshots
- Verify key elements present
- Document any new issues

### Build Verification (Every Task)
```bash
docker compose exec node npm run build   # TypeScript + Vite build
docker compose exec node npm run lint    # ESLint
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Pre-flight verification
└── Task 2: Setup Vitest test infrastructure

Wave 2 (After Wave 1):
├── Task 3: Design new color palette
└── (sequential) Task 4: Create unified MUI theme
└── (sequential) Task 5: Integrate theme + delete old files

Wave 3 (After Wave 2 — MAXIMUM PARALLELISM):
├── Task 6:  Create ToS & Privacy placeholder pages
├── Task 7:  Fix & migrate Homepage/Explore
├── Task 8:  Fix & migrate Login page
├── Task 9:  Fix & migrate Register page
├── Task 10: Fix & migrate Project Detail page
├── Task 11: Migrate Auth remaining pages (5 pages)
├── Task 12: Migrate Project form pages (4 components)
├── Task 13: Migrate Dashboard pages (5 variants)
├── Task 14: Migrate Follow/Milestone/Repository pages
├── Task 15: Migrate Admin pages (5 pages)
└── Task 16: Migrate Shared components (Header, Cards, etc.)

Wave 4 (After Wave 3):
├── Task 17: Setup Playwright auth testing
└── (after T17, parallel):
    ├── Task 18: Test student pages (7 pages)
    ├── Task 19: Test faculty pages (4 pages)
    └── Task 20: Test admin pages (7 pages)

Wave 5 (After Wave 4):
└── Task 21: Fix new issues discovered during testing

Wave 6 (After Wave 5):
└── Task 22: Final verification & cleanup

Critical Path: T1 → T3 → T4 → T5 → T7 → T17 → T18 → T21 → T22
Parallel Speedup: ~60% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3, 4, 5 | 2 |
| 2 | None | — | 1 |
| 3 | 1 | 4 | — |
| 4 | 3 | 5 | — |
| 5 | 4 | 6-16 | — |
| 6 | 5 | 22 | 7-16 |
| 7 | 5 | 17 | 6, 8-16 |
| 8 | 5 | 17 | 6-7, 9-16 |
| 9 | 5 | 17 | 6-8, 10-16 |
| 10 | 5 | 17 | 6-9, 11-16 |
| 11 | 5 | 17 | 6-10, 12-16 |
| 12 | 5 | 17 | 6-11, 13-16 |
| 13 | 5 | 17 | 6-12, 14-16 |
| 14 | 5 | 17 | 6-13, 15-16 |
| 15 | 5 | 17 | 6-14, 16 |
| 16 | 5 | 17 | 6-15 |
| 17 | 6-16 | 18, 19, 20 | — |
| 18 | 17 | 21 | 19, 20 |
| 19 | 17 | 21 | 18, 20 |
| 20 | 17 | 21 | 18, 19 |
| 21 | 18, 19, 20 | 22 | — |
| 22 | 21 | None | — |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | `category="quick"` — simple setup |
| 2 | 3, 4, 5 | `category="visual-engineering"` + `category="artistry"` for palette |
| 3 | 6-16 | `category="visual-engineering"` — up to 11 parallel agents |
| 4 | 17-20 | `load_skills=["playwright"]` — browser automation |
| 5 | 21 | `category="visual-engineering"` |
| 6 | 22 | `category="quick"` — verification |

---

## TODOs

---

- [x] 1. Pre-flight Verification

  **What to do**:
  - Verify Docker services are all running: `docker compose ps`
  - Verify build passes: `docker compose exec node npm run build`
  - Verify lint passes: `docker compose exec node npm run lint`
  - If build fails due to tvtcTheme.ts undefined property bugs, document which properties are undefined
  - Run `docker compose exec php php artisan db:seed --force` to ensure test data is seeded
  - Verify API is accessible: `curl http://localhost/api/projects`

  **Must NOT do**:
  - Do NOT fix any issues — only document them
  - Do NOT modify any source files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple verification commands, no code changes
  - **Skills**: [`playwright`]
    - `playwright`: May need browser check for frontend verification
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not needed for verification-only task
    - `test-driven-development`: Not applicable

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `docker-compose.yml` — Service definitions, health checks, port mappings

  **Configuration References**:
  - `web/package.json` — Build and lint scripts
  - `web/vite.config.ts` — Vite build configuration
  - `api/database/seeders/UserSeeder.php` — Test user credentials

  **Documentation References**:
  - `test-reports/FINAL_TESTING_REPORT.md:139-154` — Services status section
  - `CLAUDE.md:Docker Operations` — Docker commands reference

  **WHY Each Reference Matters**:
  - `docker-compose.yml`: Know which services should be running and on which ports
  - `package.json`: Know exact build/lint commands to run
  - `UserSeeder.php`: Verify expected test users exist after seeding

  **Acceptance Criteria**:

  **Automated Verification:**
  ```bash
  # Agent runs:
  docker compose ps --format json | jq '.[].State'
  # Assert: All states are "running"

  docker compose exec node npm run build 2>&1
  # Assert: Exit code 0 OR document specific errors

  docker compose exec node npm run lint 2>&1
  # Assert: Exit code 0 OR document specific errors

  curl -s http://localhost/api/projects | jq '.data | length'
  # Assert: Returns number >= 1 (seeded projects exist)

  curl -s -X POST http://localhost/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@fahras.edu","password":"password"}' | jq '.token'
  # Assert: Returns non-empty token string
  ```

  **Evidence to Capture:**
  - [ ] Full output of docker compose ps
  - [ ] Build output (success or error list)
  - [ ] Lint output (success or error list)
  - [ ] API response verification

  **Commit**: NO (no code changes)

---

- [x] 2. Setup Vitest Test Infrastructure

  **What to do**:
  - Install Vitest and dependencies inside Docker node container:
    ```bash
    docker compose exec node npm install -D vitest @vitest/ui jsdom
    ```
  - Create `web/vitest.config.ts` with jsdom environment, path aliases (@/ → src/), and setup file
  - Update `web/src/setupTests.ts` to work with Vitest (replace jest-dom import if needed)
  - Add scripts to `web/package.json`:
    - `"test": "vitest run"`
    - `"test:watch": "vitest"`
    - `"test:ui": "vitest --ui"`
  - Delete legacy test file `web/src/App.test.tsx` (CRA boilerplate, references non-existent text)
  - Update `web/src/__tests__/App.test.tsx` to work with Vitest (replace jest globals if needed)
  - Verify existing `LoginPage.test.tsx` is compatible with Vitest or note needed changes
  - Run `docker compose exec node npm run test` and verify at least one test passes

  **Must NOT do**:
  - Do NOT write comprehensive new tests (that comes later)
  - Do NOT modify LoginPage.test.tsx beyond minimal Vitest compatibility fixes
  - Do NOT install Jest — we are replacing it

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Configuration task, minimal code changes
  - **Skills**: [`test-driven-development`]
    - `test-driven-development`: Understands test framework setup patterns
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for unit test infra
    - `frontend-ui-ux`: Not UI work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: None (test infra is independent of theme work)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `web/vite.config.ts` — Existing Vite config to extend with test configuration
  - `web/src/setupTests.ts` — Existing test setup file (imports @testing-library/jest-dom)
  - `web/src/features/auth/pages/__tests__/LoginPage.test.tsx` — Existing comprehensive test file (281 lines)

  **API/Type References**:
  - `web/package.json` — Current devDependencies (has @testing-library/react, @types/jest)
  - `web/tsconfig.json` — TypeScript configuration and path aliases

  **External References**:
  - Vitest docs: Configuration with Vite projects, jsdom environment setup

  **WHY Each Reference Matters**:
  - `vite.config.ts`: Vitest config can extend or be separate from Vite config. Need to see current structure.
  - `setupTests.ts`: Currently imports jest-dom — may need `@testing-library/jest-dom/vitest` instead
  - `LoginPage.test.tsx`: Must verify this existing test is Vitest-compatible. Uses `jest.fn()` which may need `vi.fn()`
  - `package.json`: Need to know which @testing-library packages are already installed

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  docker compose exec node npm run test 2>&1
  # Assert: Exit code 0, at least 1 test passes

  docker compose exec node cat package.json | jq '.scripts.test'
  # Assert: Contains "vitest"

  docker compose exec node ls vitest.config.ts 2>/dev/null || ls vite.config.ts
  # Assert: Vitest configuration exists

  docker compose exec node ls src/App.test.tsx 2>/dev/null
  # Assert: File does NOT exist (deleted legacy CRA boilerplate)
  ```

  **Commit**: YES
  - Message: `chore(test): setup Vitest test infrastructure replacing Jest`
  - Files: `web/vitest.config.ts`, `web/package.json`, `web/src/setupTests.ts`
  - Pre-commit: `docker compose exec node npm run test`

---

- [x] 3. Design New TVTC-Inspired Color Palette

  **What to do**:
  - Study the existing TVTC brand colors: primary green `#008A3E`, teal `#18B3A8`, institutional blue `#3B7D98`, gold accent `#F3B200`
  - Study the existing hardcoded colors being used across the codebase to understand the current visual language: academic blue `#007BFF`, purple gradient `#667eea/#764ba2`, orange `#fb923c`, green `#22c55e`, violet `#a855f7`, indigo `#6366f1`
  - Design a NEW cohesive palette that:
    - Keeps TVTC green as primary brand color
    - Adds complementary semantic colors (info blue, warning amber, error red, success green)
    - Defines neutral scale (8-10 shades from near-white to near-black)
    - Defines surface/background colors
    - ALL text colors must pass WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text) against their intended backgrounds
  - Create `web/src/styles/theme/colorPalette.ts`:
    - Export typed color tokens as const objects
    - Include: primary, secondary, accent, semantic (success/warning/error/info), neutrals, surfaces, text, borders
    - Each color has: main, light, dark, contrastText variants
    - Include WCAG contrast annotations as comments
  - NO MUI theme integration yet — this is just the palette definition

  **Must NOT do**:
  - Do NOT create MUI theme in this task (that's Task 4)
  - Do NOT modify any existing components
  - Do NOT copy the existing tvtcTheme.ts palette — design fresh
  - Do NOT include dark mode variants (dark mode dropped)

  **Recommended Agent Profile**:
  - **Category**: `artistry`
    - Reason: Creative design task requiring color theory knowledge and aesthetic judgment
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Expert design knowledge for creating cohesive, accessible color systems
  - **Skills Evaluated but Omitted**:
    - `test-driven-development`: Not applicable to design task
    - `playwright`: Not needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential: T3 → T4 → T5)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1 (need pre-flight to confirm codebase state)

  **References**:

  **Pattern References**:
  - `web/src/styles/theme/tvtcTheme.ts:10-70` — Current TVTC color definitions (tvtcColors object)
  - `web/src/styles/designTokens.ts` — Existing design tokens structure (108 lines)

  **Documentation References**:
  - `test-reports/ui-ux-analysis-report.md:229-234` — WCAG contrast requirements (4.5:1 normal, 3:1 large)
  - `test-reports/ui-ux-analysis-report.md:276-282` — Color system recommendations

  **External References**:
  - WCAG 2.1 contrast checker for validating all color pairs

  **WHY Each Reference Matters**:
  - `tvtcTheme.ts:10-70`: The TVTC brand colors to preserve and build upon
  - `designTokens.ts`: See current token structure to inform new palette organization
  - `ui-ux-analysis-report.md`: Specific contrast failures to ensure new palette fixes them

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  docker compose exec node ls src/styles/theme/colorPalette.ts
  # Assert: File exists

  # Verify the file exports typed tokens:
  docker compose exec node npx tsx -e "import { colors } from './src/styles/theme/colorPalette'; console.log(Object.keys(colors))"
  # Assert: Output includes primary, secondary, neutral, semantic keys

  docker compose exec node npm run build 2>&1
  # Assert: Build passes (new file doesn't break anything since nothing imports it yet)
  ```

  **Evidence to Capture:**
  - [ ] Color palette file with all token definitions
  - [ ] WCAG contrast annotations for key text/background pairs

  **Commit**: YES
  - Message: `feat(theme): design new TVTC-inspired cohesive color palette`
  - Files: `web/src/styles/theme/colorPalette.ts`
  - Pre-commit: `docker compose exec node npm run build`

---

- [x] 4. Create Unified MUI Theme

  **What to do**:
  - Create `web/src/styles/theme/fahrasTheme.ts` — new unified MUI theme that:
    - Imports from `colorPalette.ts` (Task 3's output)
    - Defines complete MUI `createTheme()` configuration
    - Covers: palette, typography (Tahoma/Arial for RTL), spacing, breakpoints, shape, shadows
    - MUI component overrides: Button (pill-shaped), Card, TextField, Chip, IconButton, Alert, AppBar
    - Exports typed spacing/layout tokens for direct use
    - All text uses colors that pass WCAG AA against their backgrounds
    - Touch targets minimum 44px on all interactive elements
    - Focus outlines: 3px solid primary with 2px offset
  - Typography system:
    - Clear hierarchy: Display (48px), H1 (36px), H2 (28px), H3 (22px), H4 (18px), Body (16px), Caption (14px)
    - Line heights: 1.2 for headings, 1.5 for body, 1.6 for reading
    - Font weights: Regular (400), Medium (500), SemiBold (600), Bold (700)
  - Spacing system:
    - Base unit: 4px
    - Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
  - Border radius system:
    - Small (6px), Medium (10px), Large (14px), XL (20px), Pill (9999px)
  - Export CSS variables via theme for components that need raw values
  - Do NOT delete old theme files yet (that's Task 5)

  **Must NOT do**:
  - Do NOT modify App.tsx or any consumer (that's Task 5)
  - Do NOT delete tvtcTheme.ts, dashboardThemes.ts, or other old files
  - Do NOT include dark mode palette
  - Do NOT reference undefined properties (fix the primaryLight/primaryDark bug pattern)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Technical MUI theme creation requiring both design and engineering expertise
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Expert knowledge of MUI theming, component overrides, WCAG requirements
  - **Skills Evaluated but Omitted**:
    - `test-driven-development`: Theme is verified via build, not unit tests
    - `playwright`: Not needed for theme file creation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential: T3 → T4 → T5)
  - **Blocks**: Task 5
  - **Blocked By**: Task 3 (needs color palette)

  **References**:

  **Pattern References**:
  - `web/src/styles/theme/colorPalette.ts` — New palette (Task 3 output) to import
  - `web/src/styles/theme/tvtcTheme.ts:250-500` — Current MUI component overrides (reference for structure, NOT to copy)
  - `web/src/styles/theme/tvtcTheme.ts:550-650` — Current CSS variables pattern

  **API/Type References**:
  - `web/src/styles/theme/tvtcTheme.ts:1-10` — Import patterns for MUI createTheme

  **Documentation References**:
  - `test-reports/ui-ux-analysis-report.md:37-56` — Homepage issues to fix via theme (contrast, button styles)
  - `test-reports/ui-ux-analysis-report.md:96-113` — Login page issues (form field styling)
  - `test-reports/FINAL_TESTING_REPORT.md:219-234` — Accessibility requirements (contrast ratios, labels)

  **External References**:
  - MUI v7 theming docs: createTheme, component overrides, palette configuration

  **WHY Each Reference Matters**:
  - `colorPalette.ts`: Input dependency — all colors come from here
  - `tvtcTheme.ts:250-500`: See which MUI components have overrides (to maintain or improve)
  - `ui-ux-analysis-report.md`: Specific issues the theme must address (contrast, button consistency, spacing)

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  docker compose exec node ls src/styles/theme/fahrasTheme.ts
  # Assert: File exists

  docker compose exec node npx tsx -e "import { fahrasTheme } from './src/styles/theme/fahrasTheme'; console.log(fahrasTheme.palette.primary.main)"
  # Assert: Outputs a valid hex color

  docker compose exec node npm run build 2>&1
  # Assert: Build passes (new file doesn't break anything since nothing imports it yet)
  ```

  **Commit**: YES
  - Message: `feat(theme): create unified MUI theme with WCAG-compliant tokens`
  - Files: `web/src/styles/theme/fahrasTheme.ts`
  - Pre-commit: `docker compose exec node npm run build`

---

- [x] 5. Integrate New Theme & Clean Up Old Theme Files

  **What to do**:
  - **Update `web/src/App.tsx`**:
    - Replace `tvtcTheme` import with `fahrasTheme` import
    - Remove dark mode toggle logic if present
    - Keep RTL support (Emotion cache + stylis-plugin-rtl) — CRITICAL to preserve
    - Keep ErrorBoundary wrapper
  - **Update `web/src/providers/ThemeContext.tsx`**:
    - Remove role-based theme selection (no more separate admin/faculty/student themes)
    - Replace with single `fahrasTheme` for all users
    - If DashboardTheme type is exported, update to use MUI theme type instead
    - Rename custom `useTheme` hook to `useFahrasTheme` if needed to avoid conflict with MUI's `useTheme`
  - **Delete dead theme files**:
    - Delete `web/src/styles/theme/professorTheme.ts`
    - Delete `web/src/styles/theme/guestTheme.ts`
    - Delete `web/src/styles/theme/tvtcTheme.ts` (replaced by fahrasTheme.ts)
    - Delete or update `web/src/styles/designTokens.ts` (tokens now in colorPalette.ts)
  - **Migrate the one `professorColors` import**:
    - `web/src/features/projects/components/ProjectFiles.tsx` — replace `professorColors` import with new theme tokens
  - **Update `web/src/config/dashboardThemes.ts`**:
    - Either delete entirely OR refactor to derive from fahrasTheme
  - **Remove dark mode toggle**:
    - Update `web/src/store/themeStore.ts` — remove mode toggle or simplify
    - Update `web/src/components/layout/ThemeToggle.tsx` — remove or repurpose
  - **Verify all imports**: Use `grep` or `ast_grep_search` to find ALL imports of deleted files and update them
  - Verify build passes after all changes

  **Must NOT do**:
  - Do NOT remove RTL support (Emotion cache + stylis-plugin-rtl is CRITICAL)
  - Do NOT change router.tsx or route structure
  - Do NOT modify component logic — only theme imports and providers
  - Do NOT break the ProtectedRoute or RoleProtectedRoute mechanisms

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Theme integration across multiple files, requires understanding of provider patterns
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: MUI theme provider patterns, Emotion cache configuration
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for import refactoring
    - `test-driven-development`: Verified via build

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential: T3 → T4 → T5)
  - **Blocks**: Tasks 6-16 (all depend on new theme being active)
  - **Blocked By**: Task 4 (needs new theme file to exist)

  **References**:

  **Pattern References**:
  - `web/src/App.tsx:1-55` — Current theme provider setup (CacheProvider → MuiThemeProvider → CssBaseline → ThemeProvider → ErrorBoundary → Router)
  - `web/src/providers/ThemeContext.tsx` — Current custom theme context with role-based selection
  - `web/src/config/dashboardThemes.ts` — Dashboard theme definitions (177 lines)

  **API/Type References**:
  - `web/src/store/themeStore.ts` — Theme toggle store (light/dark mode)
  - `web/src/components/layout/ThemeToggle.tsx` — Dark mode toggle component

  **Migration References**:
  - `web/src/features/projects/components/ProjectFiles.tsx` — The ONE file importing professorColors

  **WHY Each Reference Matters**:
  - `App.tsx`: This is the root component — theme provider order matters. Emotion cache MUST come first for RTL.
  - `ThemeContext.tsx`: Custom theme provider that needs to be simplified or removed
  - `dashboardThemes.ts`: Contains role-based color mappings that are being unified
  - `ProjectFiles.tsx`: The one consumer of dead theme files that needs migration

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  docker compose exec node npm run build 2>&1
  # Assert: Build passes with zero errors

  # Verify old theme files are deleted:
  docker compose exec node ls src/styles/theme/professorTheme.ts 2>&1
  # Assert: "No such file" error

  docker compose exec node ls src/styles/theme/guestTheme.ts 2>&1
  # Assert: "No such file" error

  docker compose exec node ls src/styles/theme/tvtcTheme.ts 2>&1
  # Assert: "No such file" error

  # Verify new theme is being used:
  docker compose exec node grep -r "fahrasTheme" src/App.tsx
  # Assert: Found import/usage of fahrasTheme

  # Verify RTL support preserved:
  docker compose exec node grep -r "stylis-plugin-rtl" src/App.tsx
  # Assert: stylis-plugin-rtl still imported

  # Verify no remaining imports of deleted files:
  docker compose exec node grep -rn "tvtcTheme\|professorTheme\|guestTheme\|dashboardThemes" src/ --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v "\.d\.ts"
  # Assert: Zero results (no remaining references to old themes)
  ```

  **Commit**: YES
  - Message: `refactor(theme): integrate unified theme, remove old theme system and dark mode`
  - Files: `web/src/App.tsx`, `web/src/providers/ThemeContext.tsx`, `web/src/store/themeStore.ts`, deleted theme files
  - Pre-commit: `docker compose exec node npm run build`

---

- [x] 6. Create Terms of Service & Privacy Policy Placeholder Pages

  **What to do**:
  - Create `web/src/pages/TermsOfServicePage.tsx` — placeholder ToS page with:
    - Professional layout using new theme
    - Template sections: Introduction, User Accounts, Acceptable Use, Intellectual Property, Limitation of Liability, Changes to Terms, Contact Information
    - Placeholder text clearly marked as "[PLACEHOLDER — Replace with actual legal text]"
    - Last updated date
  - Create `web/src/pages/PrivacyPolicyPage.tsx` — placeholder Privacy Policy with:
    - Template sections: Information We Collect, How We Use Information, Data Sharing, Security, Your Rights, Cookies, Contact
    - Placeholder text clearly marked
  - Add routes in `web/src/router.tsx`:
    - `/terms` → TermsOfServicePage (public)
    - `/privacy` → PrivacyPolicyPage (public)
  - Add footer links to ToS and Privacy Policy:
    - Update footer component (likely in `web/src/components/layout/AppLayout.tsx` or similar)
  - Add links to Register page:
    - Update `web/src/features/auth/pages/RegisterPage.tsx` — add "By registering, you agree to our Terms of Service and Privacy Policy" with links
  - Add links to Login page:
    - Update `web/src/features/auth/pages/LoginPage.tsx` — add footer links

  **Must NOT do**:
  - Do NOT write real legal text — placeholder only
  - Do NOT add cookie consent banner (separate concern)
  - Do NOT modify existing page functionality

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward page creation with template content
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Professional page layout using MUI components
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for page creation
    - `test-driven-development`: Simple pages, verified via navigation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7-16)
  - **Blocks**: Task 22 (final verification)
  - **Blocked By**: Task 5 (needs new theme active)

  **References**:

  **Pattern References**:
  - `web/src/router.tsx:10-40` — Route definition patterns for public pages
  - `web/src/pages/HomePage.tsx` — Existing page component structure to follow
  - `web/src/features/auth/pages/RegisterPage.tsx` — Where to add ToS/Privacy links

  **Documentation References**:
  - `test-reports/ui-ux-analysis-report.md:121` — Critical issue: Missing Terms of Service/Privacy Policy

  **WHY Each Reference Matters**:
  - `router.tsx`: Know exact pattern for adding public routes
  - `RegisterPage.tsx`: The specific component that needs legal links added

  **Acceptance Criteria**:

  **Playwright verification:**
  ```
  1. Navigate to: http://localhost:3000/terms
  2. Assert: Page renders with "Terms of Service" heading
  3. Assert: Text contains "[PLACEHOLDER"
  4. Navigate to: http://localhost:3000/privacy
  5. Assert: Page renders with "Privacy Policy" heading
  6. Navigate to: http://localhost:3000/register
  7. Assert: Page contains links to /terms and /privacy
  8. Screenshot: .sisyphus/evidence/task-6-legal-pages.png
  ```

  **Commit**: YES
  - Message: `feat(legal): add placeholder Terms of Service and Privacy Policy pages`
  - Files: `web/src/pages/TermsOfServicePage.tsx`, `web/src/pages/PrivacyPolicyPage.tsx`, `web/src/router.tsx`, footer component
  - Pre-commit: `docker compose exec node npm run build`

---

- [x] 7. Fix & Migrate Homepage / Explore Pages

  **What to do**:
  - Replace ALL hardcoded hex colors in ExplorePage and related components with theme tokens
  - Fix all reported issues for Homepage:
    - **HIGH**: Fix low contrast text (subtitle, description, placeholder text) — use theme text colors passing WCAG AA
    - **HIGH**: Improve empty state — add helpful actions (view categories, create account CTA)
    - **MEDIUM**: Add text labels or aria-labels to all navigation/category icons
    - **MEDIUM**: Unify button styles (use theme's button component overrides)
    - **MEDIUM**: Fix category filter for mobile (dropdown or grid instead of horizontal scroll)
    - **MEDIUM**: Remove rocket emoji (🚀) — use proper icon or remove
    - **MEDIUM**: Fix search control alignment (vertical centering)
    - **MEDIUM**: Fix tag/badge contrast (darker background or darker text)
    - **MEDIUM**: Fix inconsistent icon styles (choose all outlined or all filled)
    - **MEDIUM**: Fix inconsistent card padding
    - **MEDIUM**: Remove "0 files" display when count is zero
    - **MEDIUM**: Fix typography hierarchy (deliberate font weights)
    - **MEDIUM**: Reduce overuse of green — use semantic colors from new palette
    - **LOW**: Fix footer alignment (Arabic/English)
    - **LOW**: Improve line heights for readability
    - **LOW**: Fix filter bar alignment
    - **LOW**: Fix line length on project descriptions (max-width)
    - **LOW**: Unify border styles (cards vs filter section)

  **Must NOT do**:
  - Do NOT restructure component hierarchy
  - Do NOT change routing or data fetching logic
  - Do NOT modify API calls or response handling

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI fixes requiring design knowledge and MUI expertise
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: WCAG compliance, MUI component patterns, responsive design
  - **Skills Evaluated but Omitted**:
    - `playwright`: Verification can be done via build
    - `test-driven-development`: Visual changes verified via build + screenshot

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 8-16)
  - **Blocks**: Task 17
  - **Blocked By**: Task 5

  **References**:

  **Pattern References**:
  - `web/src/features/projects/pages/ExplorePage.tsx` — Main explore page component
  - `web/src/pages/HomePage.tsx` — Home page component
  - `web/src/components/explore/ProjectGrid.tsx` — Project grid component
  - `web/src/components/explore/ProjectGridCard.tsx` — Individual project cards
  - `web/src/components/explore/AdvancedFilters.tsx` — Filter components
  - `web/src/styles/theme/fahrasTheme.ts` — New theme to use

  **Documentation References**:
  - `test-reports/ui-ux-analysis-report.md:29-85` — All Homepage issues (empty state + with projects)

  **WHY Each Reference Matters**:
  - `ExplorePage.tsx`: Primary file to modify — contains hardcoded colors and layout issues
  - `ProjectGridCard.tsx`: Contains project card styling with tag contrast issues
  - `ui-ux-analysis-report.md:29-85`: Exact list of every issue to fix on this page

  **Acceptance Criteria**:

  ```bash
  # Agent runs after changes:
  docker compose exec node npm run build 2>&1
  # Assert: Build passes

  # Verify no hardcoded hex colors remain:
  # Use ast_grep_search pattern "#" in ExplorePage.tsx, HomePage.tsx, ProjectGrid*.tsx
  # Assert: Zero matches for hex color patterns like #XXXXXX
  ```

  **Playwright verification:**
  ```
  1. Navigate to: http://localhost:3000/explore
  2. Assert: Empty state shows helpful actions (not just "No projects")
  3. Assert: No rocket emoji visible
  4. Assert: Text elements have sufficient contrast
  5. Screenshot: .sisyphus/evidence/task-7-homepage.png (1920x1080)
  6. Screenshot: .sisyphus/evidence/task-7-homepage-mobile.png (375x812)
  ```

  **Commit**: YES
  - Message: `fix(ui): remediate all Homepage/Explore UI issues and migrate to theme tokens`
  - Files: ExplorePage.tsx, HomePage.tsx, ProjectGrid*.tsx, AdvancedFilters.tsx
  - Pre-commit: `docker compose exec node npm run build`

---

- [x] 8. Fix & Migrate Login Page

  **What to do**:
  - Replace ALL hardcoded hex colors (especially `#007BFF`) with theme tokens
  - Fix all reported issues:
    - **HIGH**: Replace placeholder-as-label with proper `<label>` elements using MUI TextField's `label` prop (NOT `placeholder`)
    - **HIGH**: Fix low contrast placeholder text
    - **MEDIUM**: Add password visibility toggle (eye icon button)
    - **MEDIUM**: Fix link contrast for "Forgot password?" and "Sign up"
    - **MEDIUM**: Fix vertical centering (center form card on page)
    - **MEDIUM**: Improve font weights for readability
    - **LOW**: Add "Remember me" checkbox
    - **LOW**: Fix spacing between title and form
  - Ensure form fields use MUI TextField `label` prop (which renders proper `<label>` elements and keeps labels visible when focused/filled)
  - Ensure all interactive elements have aria-labels

  **Must NOT do**:
  - Do NOT modify auth store logic or API calls
  - Do NOT change form submission behavior
  - Do NOT change validation logic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Accessibility-focused UI fixes for forms
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: WCAG form accessibility, MUI TextField patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6-7, 9-16)
  - **Blocks**: Task 17
  - **Blocked By**: Task 5

  **References**:

  **Pattern References**:
  - `web/src/features/auth/pages/LoginPage.tsx` — Login page component (primary file to modify)
  - `web/src/styles/theme/fahrasTheme.ts` — New theme tokens

  **Documentation References**:
  - `test-reports/ui-ux-analysis-report.md:88-113` — All Login page issues
  - `test-reports/FINAL_TESTING_REPORT.md:225-230` — Form label fix requirements

  **WHY Each Reference Matters**:
  - `LoginPage.tsx`: The single file containing all login page styling
  - `ui-ux-analysis-report.md:88-113`: Every specific issue to fix

  **Acceptance Criteria**:

  ```bash
  docker compose exec node npm run build 2>&1
  # Assert: Build passes

  # Verify no hardcoded hex colors:
  # ast_grep_search for hex patterns in LoginPage.tsx
  # Assert: Zero hex color matches
  ```

  **Playwright verification:**
  ```
  1. Navigate to: http://localhost:3000/login
  2. Assert: All form fields have visible <label> elements (not just placeholders)
  3. Assert: Password field has visibility toggle button
  4. Assert: "Forgot password?" link has sufficient contrast
  5. Assert: Form is vertically centered on page
  6. Screenshot: .sisyphus/evidence/task-8-login.png
  ```

  **Commit**: YES
  - Message: `fix(auth): remediate Login page accessibility and migrate to theme tokens`
  - Files: `web/src/features/auth/pages/LoginPage.tsx`
  - Pre-commit: `docker compose exec node npm run build`

---

- [x] 9. Fix & Migrate Register Page

  **What to do**:
  - Replace ALL hardcoded hex colors with theme tokens
  - Fix all reported issues:
    - **HIGH**: Replace placeholder-as-label with proper labels (MUI TextField `label` prop)
    - **HIGH**: Fix low contrast placeholder text
    - **HIGH**: Add password visibility toggle
    - **HIGH**: Display password requirements (minimum length, character requirements) below password field
    - **MEDIUM**: Fix link contrast for "Log in" link
    - **MEDIUM**: Add inline validation feedback (real-time as user types)
    - **MEDIUM**: Fix vertical centering
    - **MEDIUM**: Fix font sizes for secondary text
    - **LOW**: Fix social button widths (consistent sizing)
    - **LOW**: Fix spacing consistency
    - **LOW**: Unify element styling (buttons, inputs, social buttons)
  - Add password strength indicator below password field
  - Links to ToS and Privacy pages already handled in Task 6

  **Must NOT do**:
  - Do NOT modify registration API logic
  - Do NOT change email domain validation logic
  - Do NOT modify password confirmation behavior

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex form accessibility improvements
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Form UX patterns, password strength indicators

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6-8, 10-16)
  - **Blocks**: Task 17
  - **Blocked By**: Task 5

  **References**:

  **Pattern References**:
  - `web/src/features/auth/pages/RegisterPage.tsx` — Register page component
  - `web/src/features/auth/pages/LoginPage.tsx` — After Task 8 fixes, use as pattern for form field labels

  **Documentation References**:
  - `test-reports/ui-ux-analysis-report.md:116-139` — All Register page issues

  **WHY Each Reference Matters**:
  - `RegisterPage.tsx`: The primary file to modify
  - `LoginPage.tsx` (after T8): Consistent form patterns to follow

  **Acceptance Criteria**:

  ```bash
  docker compose exec node npm run build 2>&1
  # Assert: Build passes
  ```

  **Playwright verification:**
  ```
  1. Navigate to: http://localhost:3000/register
  2. Assert: All form fields have visible <label> elements
  3. Assert: Password field has visibility toggle
  4. Assert: Password requirements text visible below password field
  5. Assert: ToS and Privacy links present (from Task 6)
  6. Screenshot: .sisyphus/evidence/task-9-register.png
  ```

  **Commit**: YES
  - Message: `fix(auth): remediate Register page accessibility, add password features`
  - Files: `web/src/features/auth/pages/RegisterPage.tsx`
  - Pre-commit: `docker compose exec node npm run build`

---

- [x] 10. Fix & Migrate Project Detail Page

  **What to do**:
  - Replace ALL hardcoded hex colors with theme tokens
  - Fix all reported issues:
    - **HIGH**: Fix low contrast description text
    - **HIGH**: Fix cramped right column spacing
    - **HIGH**: Make deliverables clearly interactive (download indicators, hover states)
    - **MEDIUM**: Strengthen content hierarchy (larger/bolder section titles)
    - **MEDIUM**: Fix inconsistent key-value styling
    - **MEDIUM**: Add context to progress bar (what does 50% mean?)
    - **MEDIUM**: Fix inconsistent spacing between sections
    - **MEDIUM**: Add aria-labels to icon-only buttons ("Share", "View project")
    - **LOW**: Display keywords as chips/tags instead of plain text
    - **LOW**: Unify shadow usage (main card + sidebar)
    - **LOW**: Fix status label alignment
    - **LOW**: Add breadcrumb navigation

  **Must NOT do**:
  - Do NOT modify API data fetching logic
  - Do NOT change project data model
  - Do NOT add new features beyond fixing reported issues

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Layout improvements, accessibility, interactive elements
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Content hierarchy, responsive layout, interactive affordances

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6-9, 11-16)
  - **Blocks**: Task 17
  - **Blocked By**: Task 5

  **References**:

  **Pattern References**:
  - `web/src/features/projects/pages/ProjectDetailPage.tsx` — Main project detail page
  - `web/src/features/projects/pages/GuestProjectDetailPage.tsx` — Guest variant
  - `web/src/components/shared/Breadcrumb.tsx` — Existing breadcrumb component to use

  **Documentation References**:
  - `test-reports/ui-ux-analysis-report.md:142-166` — All Project Detail page issues

  **WHY Each Reference Matters**:
  - `ProjectDetailPage.tsx`: Primary file with all reported issues
  - `Breadcrumb.tsx`: Already exists — just needs to be added to this page

  **Acceptance Criteria**:

  ```bash
  docker compose exec node npm run build 2>&1
  # Assert: Build passes
  ```

  **Playwright verification:**
  ```
  1. Navigate to: http://localhost:3000/explore (get a project slug)
  2. Navigate to: http://localhost:3000/pr/{slug}
  3. Assert: Breadcrumb navigation visible
  4. Assert: Description text has sufficient contrast
  5. Assert: Keywords displayed as chips/tags
  6. Assert: Icon buttons have aria-labels
  7. Screenshot: .sisyphus/evidence/task-10-project-detail.png
  ```

  **Commit**: YES
  - Message: `fix(projects): remediate Project Detail page UI issues and migrate to theme tokens`
  - Files: `web/src/features/projects/pages/ProjectDetailPage.tsx`, `web/src/features/projects/pages/GuestProjectDetailPage.tsx`
  - Pre-commit: `docker compose exec node npm run build`

---

- [x] 11. Migrate Auth Feature Remaining Pages

  **What to do**:
  - Replace ALL hardcoded hex colors with theme tokens in:
    - `web/src/features/auth/pages/ForgotPasswordPage.tsx`
    - `web/src/features/auth/pages/ResetPasswordPage.tsx`
    - `web/src/features/auth/pages/EmailVerificationPage.tsx`
    - Any auth-related form components (OTPInput, ChangePasswordForm if they exist)
  - Apply consistent form styling patterns from Tasks 8-9 (proper labels, password toggles where applicable)
  - Ensure all text passes WCAG AA contrast

  **Must NOT do**:
  - Do NOT change auth flow logic
  - Do NOT modify API calls
  - Do NOT change email verification behavior

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Systematic color migration + form consistency
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Form consistency patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6-10, 12-16)
  - **Blocks**: Task 17
  - **Blocked By**: Task 5

  **References**:

  **Pattern References**:
  - `web/src/features/auth/pages/LoginPage.tsx` (after Task 8) — Form styling pattern to follow
  - `web/src/features/auth/pages/ForgotPasswordPage.tsx` — File to migrate
  - `web/src/features/auth/pages/ResetPasswordPage.tsx` — File to migrate
  - `web/src/features/auth/pages/EmailVerificationPage.tsx` — File to migrate

  **WHY Each Reference Matters**:
  - `LoginPage.tsx` (after T8): Consistent pattern for auth forms (labels, spacing, contrast)
  - Other auth pages: Direct targets for color migration

  **Acceptance Criteria**:

  ```bash
  docker compose exec node npm run build 2>&1
  # Assert: Build passes

  # Verify no hardcoded hex colors in auth pages:
  # ast_grep_search for hex patterns in auth feature files
  # Assert: Zero hex color matches in auth/pages/*.tsx
  ```

  **Commit**: YES
  - Message: `fix(auth): migrate remaining auth pages to theme tokens`
  - Files: ForgotPasswordPage.tsx, ResetPasswordPage.tsx, EmailVerificationPage.tsx
  - Pre-commit: `docker compose exec node npm run build`

---

- [x] 12. Migrate Project Form Pages

  **What to do**:
  - Replace ALL hardcoded hex colors (~80+ purple gradient instances, ~60+ orange instances) in:
    - `web/src/features/projects/pages/CreateProjectPage.tsx`
    - `web/src/features/projects/pages/EditProjectPage.tsx`
    - Project form sub-components (ProjectBasicInfoForm, MemberManagementForm, etc.)
  - These files have the HIGHEST concentration of hardcoded colors (purple `#667eea/#764ba2`, orange `#fb923c`, green `#22c55e`, violet `#a855f7`)
  - Replace all gradient definitions with theme-based alternatives
  - Ensure form fields use proper labels (not placeholder-as-label)

  **Must NOT do**:
  - Do NOT change form submission logic
  - Do NOT modify file upload behavior
  - Do NOT change project creation/editing flow

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: High-volume color migration with gradient replacements
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Gradient design, form styling

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6-11, 13-16)
  - **Blocks**: Task 17
  - **Blocked By**: Task 5

  **References**:

  **Pattern References**:
  - `web/src/features/projects/pages/CreateProjectPage.tsx` — Primary file (~40+ hardcoded colors)
  - `web/src/features/projects/pages/EditProjectPage.tsx` — Highest color density (~100+ hardcoded colors)
  - Search for sub-components: `ProjectBasicInfoForm`, `MemberManagementForm` within projects feature

  **WHY Each Reference Matters**:
  - These files contain the MOST hardcoded colors in the entire codebase
  - EditProjectPage alone has ~100+ hex color instances including gradients

  **Acceptance Criteria**:

  ```bash
  docker compose exec node npm run build 2>&1
  # Assert: Build passes

  # Verify no hardcoded hex colors in project form files:
  # ast_grep_search for hex patterns in CreateProjectPage.tsx, EditProjectPage.tsx
  # Assert: Zero hex color matches
  ```

  **Commit**: YES
  - Message: `fix(projects): migrate project form pages from hardcoded colors to theme tokens`
  - Files: CreateProjectPage.tsx, EditProjectPage.tsx, form sub-components
  - Pre-commit: `docker compose exec node npm run build`

---

- [x] 13. Migrate Dashboard Pages

  **What to do**:
  - Replace ALL hardcoded hex colors and custom DashboardTheme references in:
    - `web/src/features/dashboards/pages/DashboardPage.tsx`
    - Dashboard variant components (AdminDashboard, StudentDashboard, ReviewerDashboard, FacultyDashboard if they exist as separate components)
  - These previously used the custom `useTheme()` from ThemeContext — update to use MUI theme
  - Replace `const { theme } = useTheme()` with `const theme = useTheme()` (MUI hook) or new `useFahrasTheme()`
  - Replace all `theme.primary`, `theme.accent`, `theme.borderColor`, `theme.appBarGradient` references with MUI theme equivalents

  **Must NOT do**:
  - Do NOT change dashboard data fetching logic
  - Do NOT remove role-based content differences (admin sees different widgets than student)
  - Do NOT modify stats card calculations

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Theme system migration from custom to MUI
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: MUI theme consumption patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6-12, 14-16)
  - **Blocks**: Task 17
  - **Blocked By**: Task 5

  **References**:

  **Pattern References**:
  - `web/src/features/dashboards/pages/DashboardPage.tsx` — Main dashboard
  - `web/src/config/dashboardThemes.ts` — Old DashboardTheme type and properties (theme.primary, theme.accent, etc.)
  - `web/src/components/shared/DashboardHeader.tsx` — Dashboard header component
  - `web/src/components/shared/DashboardContainer.tsx` — Dashboard container
  - `web/src/components/shared/StatsCard.tsx` — Stats card component

  **WHY Each Reference Matters**:
  - `DashboardPage.tsx`: Primary target — uses custom theme hook
  - `dashboardThemes.ts`: Maps old property names to understand what needs replacing
  - Dashboard shared components: May also reference custom theme

  **Acceptance Criteria**:

  ```bash
  docker compose exec node npm run build 2>&1
  # Assert: Build passes

  # Verify no custom theme imports remain:
  docker compose exec node grep -rn "dashboardThemes\|DashboardTheme" src/ --include="*.tsx" --include="*.ts" | grep -v "\.d\.ts"
  # Assert: Zero results
  ```

  **Commit**: YES
  - Message: `fix(dashboard): migrate dashboard pages from custom theme to unified MUI theme`
  - Files: DashboardPage.tsx, dashboard variant components, shared dashboard components
  - Pre-commit: `docker compose exec node npm run build`

---

- [x] 14. Migrate Follow / Milestone / Repository Pages

  **What to do**:
  - Replace ALL hardcoded hex colors with theme tokens in:
    - `web/src/features/project-follow/pages/ProjectFollowPage.tsx` and sub-components
    - `web/src/features/milestones/pages/MilestoneTemplateConfigPage.tsx` and sub-components (TemplateEditor, ProgramTemplateSelector, MilestoneTimeline)
    - `web/src/features/repository/pages/RepositoryPage.tsx`
    - `web/src/features/notifications/pages/NotificationsPage.tsx`
    - `web/src/features/bookmarks/pages/MyBookmarksPage.tsx`
  - Status colors (`#4caf50` success, `#f44336` error, `#ff9800` warning) → use theme semantic tokens
  - Milestone template colors (`#1976D2`, `#BDBDBD`, `#757575`) → use theme tokens

  **Must NOT do**:
  - Do NOT change project follow/unfollow logic
  - Do NOT modify milestone template CRUD operations
  - Do NOT change repository viewer functionality

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Multiple page color migration
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Semantic color usage patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6-13, 15-16)
  - **Blocks**: Task 17
  - **Blocked By**: Task 5

  **References**:

  **Pattern References**:
  - `web/src/features/project-follow/` — Follow feature files
  - `web/src/features/milestones/` — Milestone feature files
  - `web/src/features/repository/` — Repository feature files
  - `web/src/features/notifications/` — Notifications feature files
  - `web/src/features/bookmarks/` — Bookmarks feature files

  **WHY Each Reference Matters**:
  - Each feature directory contains pages and components with hardcoded status/semantic colors

  **Acceptance Criteria**:

  ```bash
  docker compose exec node npm run build 2>&1
  # Assert: Build passes

  # Verify no hardcoded hex colors in these feature directories
  ```

  **Commit**: YES
  - Message: `fix(features): migrate Follow, Milestone, Repository, Notifications, Bookmarks to theme tokens`
  - Files: All files in affected feature directories
  - Pre-commit: `docker compose exec node npm run build`

---

- [x] 15. Migrate Admin Pages

  **What to do**:
  - Replace ALL hardcoded hex colors with theme tokens in:
    - `web/src/features/access-control/pages/AccessControlPage.tsx`
    - `web/src/pages/UserManagementPage.tsx`
    - `web/src/pages/ApprovalsPage.tsx`
    - `web/src/pages/AdminProjectApprovalPage.tsx`
    - `web/src/pages/FacultyPendingApprovalPage.tsx`
    - `web/src/pages/AnalyticsPage.tsx`
    - `web/src/pages/EvaluationsPage.tsx`
    - `web/src/pages/StudentMyProjectsPage.tsx`
  - These pages may use custom dashboard theme — update to MUI theme

  **Must NOT do**:
  - Do NOT change RBAC logic
  - Do NOT modify approval workflows
  - Do NOT change user management CRUD

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Multiple admin page color migration
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Admin UI patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6-14, 16)
  - **Blocks**: Task 17
  - **Blocked By**: Task 5

  **References**:

  **Pattern References**:
  - Files listed above — all admin-accessible pages
  - `web/src/features/access-control/` — Access control feature directory

  **Acceptance Criteria**:

  ```bash
  docker compose exec node npm run build 2>&1
  # Assert: Build passes
  ```

  **Commit**: YES
  - Message: `fix(admin): migrate admin and management pages to theme tokens`
  - Files: All admin page files listed above
  - Pre-commit: `docker compose exec node npm run build`

---

- [x] 16. Migrate Shared Components

  **What to do**:
  - Replace ALL hardcoded hex colors with theme tokens in shared components:
    - `web/src/components/layout/Header.tsx`
    - `web/src/components/layout/AppLayout.tsx`
    - `web/src/components/layout/MobileDrawer.tsx`
    - `web/src/components/layout/PrimaryNav.tsx`
    - `web/src/components/layout/UtilityBar.tsx`
    - `web/src/components/shared/ProjectCard.tsx`
    - `web/src/components/shared/ProjectTable.tsx`
    - `web/src/components/explore/ProjectGridCard.tsx`
    - `web/src/components/CommentSection.tsx`
    - `web/src/components/RatingSection.tsx`
    - `web/src/components/StatusSelector.tsx`
    - `web/src/components/TVTCBranding.tsx`
    - All other shared components with hardcoded colors
  - Ensure all icon buttons have aria-labels
  - Ensure all interactive elements have 44px minimum touch targets
  - Fix footer alignment (Arabic/English)

  **Must NOT do**:
  - Do NOT change component APIs or props
  - Do NOT restructure component hierarchy
  - Do NOT add new functionality

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Cross-cutting shared component updates
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Component library patterns, accessibility

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6-15)
  - **Blocks**: Task 17
  - **Blocked By**: Task 5

  **References**:

  **Pattern References**:
  - All shared component files listed above
  - `web/src/utils/accessibility.ts` — Existing accessibility utilities to leverage

  **Acceptance Criteria**:

  ```bash
  docker compose exec node npm run build 2>&1
  # Assert: Build passes

  # FINAL verification — zero hardcoded hex colors in entire src/:
  # ast_grep_search for hex color patterns across ALL .tsx files
  # Assert: Zero matches (all colors now from theme tokens)
  ```

  **Commit**: YES
  - Message: `fix(components): migrate all shared components to theme tokens, add aria-labels`
  - Files: All shared component files
  - Pre-commit: `docker compose exec node npm run build`

---

- [x] 17. Setup Playwright Auth Testing

  **What to do**:
  - Create Playwright test helper for authenticated page testing:
    - Login function that navigates to /login, fills credentials, submits, waits for redirect
    - Use React Testing Library-compatible approach (fill form fields via Playwright, click submit)
    - Support multiple roles: admin, faculty, student
  - Create test file structure for authenticated page tests
  - Verify login works with at least one test credential via Playwright
  - Create screenshot directory: `.sisyphus/evidence/playwright/`

  **Must NOT do**:
  - Do NOT use programmatic `input.value` setting (React controlled components need proper fill)
  - Do NOT bypass auth (always test through the actual login form)
  - Do NOT modify any application code

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Test setup and verification
  - **Skills**: [`playwright`]
    - `playwright`: Browser automation, form filling, screenshot capture
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not modifying UI
    - `test-driven-development`: This is browser testing, not unit testing

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (setup before T18-T20)
  - **Blocks**: Tasks 18, 19, 20
  - **Blocked By**: Tasks 6-16 (all fixes must be applied before testing)

  **References**:

  **Pattern References**:
  - `web/src/features/auth/pages/LoginPage.tsx` — Login form structure (field names, submit button)
  - `web/LOGIN_FORM_TESTING_GUIDE.md` — Testing guide from previous session
  - `web/FORM_TESTING_EXAMPLES.md` — Form testing examples

  **Documentation References**:
  - `test-reports/FINAL_TESTING_REPORT.md:37-49` — Auth testing findings
  - `CLAUDE.md:Access Points` — Port numbers and URLs

  **WHY Each Reference Matters**:
  - `LoginPage.tsx`: Know exact form field names/selectors for Playwright
  - `LOGIN_FORM_TESTING_GUIDE.md`: Previous session's findings about React controlled component testing
  - Testing guide warns: Must use proper form fill methods, not `input.value` setting

  **Acceptance Criteria**:

  **Playwright verification:**
  ```
  1. Start browser
  2. Navigate to: http://localhost:3000/login
  3. Fill email: "admin@fahras.edu"
  4. Fill password: "password"
  5. Click submit button
  6. Wait for navigation to /dashboard
  7. Assert: URL contains "/dashboard"
  8. Assert: No error messages visible
  9. Screenshot: .sisyphus/evidence/playwright/auth-test-success.png
  ```

  **Commit**: NO (test files only, no code changes)

---

- [x] 18. Test Student Authenticated Pages (7 Pages)

  **What to do**:
  - Login as student: `ahmed.almansouri@student.fahras.edu` / `password`
  - Navigate to and screenshot each page:
    1. `/dashboard` — Student dashboard
    2. `/student/my-projects` — Student project management
    3. `/pr/create` — Create project page
    4. `/pr/{slug}/edit` — Edit project page (navigate to an existing project first)
    5. `/pr/{slug}/follow` — Project following page
    6. `/pr/{slug}/code` — Repository viewer
    7. `/notifications` — Notifications page
  - Also test: `/profile`, `/settings` (protected, any role)
  - For each page:
    - Verify page renders without console errors
    - Verify key elements are present (headings, navigation, content areas)
    - Capture screenshot at 1920x1080
    - Document any NEW issues found (severity + description)

  **Must NOT do**:
  - Do NOT fix any issues found — document only
  - Do NOT modify any source files
  - Do NOT create projects or modify data

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Systematic page verification, not heavy engineering
  - **Skills**: [`playwright`]
    - `playwright`: Browser automation, screenshot capture, console error detection

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 19, 20 — after T17)
  - **Blocks**: Task 21
  - **Blocked By**: Task 17

  **References**:

  **Documentation References**:
  - `test-reports/ui-ux-analysis-report.md:306-313` — Student pages list
  - `CLAUDE.md:Access Points` — Service URLs

  **Test Credentials**:
  - Student: `ahmed.almansouri@student.fahras.edu` / `password`

  **Acceptance Criteria**:

  **Playwright verification:**
  ```
  For each of the 7+ pages:
  1. Navigate to page URL
  2. Wait for page load (no loading spinner)
  3. Capture console messages (filter for errors)
  4. Assert: No JavaScript errors in console
  5. Assert: Page heading or key content visible
  6. Screenshot: .sisyphus/evidence/playwright/student-{page-name}.png
  ```

  **Evidence to Capture:**
  - [ ] 7+ screenshots in .sisyphus/evidence/playwright/
  - [ ] List of any NEW issues found (structured: severity, page, description)
  - [ ] Console error log (if any)

  **Commit**: NO (documentation only)

---

- [x] 19. Test Faculty Authenticated Pages (4 Pages)

  **What to do**:
  - Login as faculty: `sarah.johnson@fahras.edu` / `password`
  - Navigate to and screenshot each page:
    1. `/dashboard` — Faculty dashboard
    2. `/evaluations` — Project evaluations
    3. `/advisor-projects` — Faculty advisor dashboard
    4. `/faculty/pending-approvals` — Pending approvals
  - Also test: `/analytics` (faculty has access)
  - For each page: verify renders, capture screenshot, document new issues

  **Must NOT do**:
  - Do NOT fix issues — document only
  - Do NOT approve/reject any projects

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 18, 20)
  - **Blocks**: Task 21
  - **Blocked By**: Task 17

  **References**:

  **Test Credentials**:
  - Faculty: `sarah.johnson@fahras.edu` / `password`

  **Acceptance Criteria**:

  **Playwright verification:**
  ```
  For each of the 4+ pages:
  1. Navigate to page URL
  2. Assert: No JavaScript errors in console
  3. Assert: Page content visible
  4. Screenshot: .sisyphus/evidence/playwright/faculty-{page-name}.png
  ```

  **Commit**: NO (documentation only)

---

- [x] 20. Test Admin Authenticated Pages (7 Pages)

  **What to do**:
  - Login as admin: `admin@fahras.edu` / `password`
  - Navigate to and screenshot each page:
    1. `/dashboard` — Admin dashboard
    2. `/users` — User management
    3. `/approvals` — General approvals
    4. `/admin/approvals` — Admin project approvals
    5. `/access-control` — Role and permission management
    6. `/milestone-templates` — Milestone template configuration
    7. `/analytics` — System analytics
  - For each page: verify renders, capture screenshot, document new issues

  **Must NOT do**:
  - Do NOT modify users, roles, or permissions
  - Do NOT approve/reject projects

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 18, 19)
  - **Blocks**: Task 21
  - **Blocked By**: Task 17

  **References**:

  **Test Credentials**:
  - Admin: `admin@fahras.edu` / `password`

  **Acceptance Criteria**:

  **Playwright verification:**
  ```
  For each of the 7 pages:
  1. Navigate to page URL
  2. Assert: No JavaScript errors in console
  3. Assert: Page content visible
  4. Screenshot: .sisyphus/evidence/playwright/admin-{page-name}.png
  ```

  **Commit**: NO (documentation only)

---

- [x] 21. Fix New Issues Discovered During Testing

  **What to do**:
  - Review all new issues documented in Tasks 18-20
  - Fix issues using theme tokens (NOT hardcoded colors)
  - Fix issues by severity: Critical → High → Medium → Low
  - Each fix should be consistent with the new design system

  **Must NOT do**:
  - Do NOT add new features beyond fixing reported issues
  - Do NOT re-enter design system to "improve" — use existing tokens only
  - Do NOT change component structure or logic
  - If no new issues found, mark this task as complete immediately

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI fixes using established theme
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Apply fixes consistent with design system

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 5 (sequential)
  - **Blocks**: Task 22
  - **Blocked By**: Tasks 18, 19, 20

  **Acceptance Criteria**:

  ```bash
  docker compose exec node npm run build 2>&1
  # Assert: Build passes

  docker compose exec node npm run lint 2>&1
  # Assert: Lint passes
  ```

  **Commit**: YES (if changes made)
  - Message: `fix(ui): address issues discovered during authenticated page testing`
  - Pre-commit: `docker compose exec node npm run build && docker compose exec node npm run lint`

---

- [x] 22. Final Verification & Cleanup

  **What to do**:
  - Run full build: `docker compose exec node npm run build`
  - Run full lint: `docker compose exec node npm run lint`
  - Run Vitest: `docker compose exec node npm run test`
  - Verify ZERO hardcoded hex colors remain in .tsx files using ast_grep_search
  - Verify old theme files are deleted (professorTheme.ts, guestTheme.ts, tvtcTheme.ts)
  - Verify RTL support works (switch language, check direction)
  - Take final screenshots of all 5 originally-tested pages for comparison
  - Generate summary report of all changes made

  **Must NOT do**:
  - Do NOT make code changes (verification only)
  - If issues found, create a new follow-up task — do NOT fix inline

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification commands only
  - **Skills**: [`playwright`]
    - `playwright`: Final screenshot capture and verification

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 6 (final)
  - **Blocks**: None (last task)
  - **Blocked By**: Task 21

  **Acceptance Criteria**:

  ```bash
  # Build verification:
  docker compose exec node npm run build 2>&1
  # Assert: Exit code 0

  # Lint verification:
  docker compose exec node npm run lint 2>&1
  # Assert: Exit code 0

  # Test verification:
  docker compose exec node npm run test 2>&1
  # Assert: Exit code 0, all tests pass

  # Zero hardcoded colors:
  # ast_grep_search for hex patterns across all .tsx files
  # Assert: Zero matches

  # Old theme files deleted:
  docker compose exec node ls src/styles/theme/tvtcTheme.ts 2>&1
  # Assert: "No such file"
  docker compose exec node ls src/styles/theme/professorTheme.ts 2>&1
  # Assert: "No such file"
  docker compose exec node ls src/styles/theme/guestTheme.ts 2>&1
  # Assert: "No such file"
  ```

  **Playwright verification:**
  ```
  1. Navigate to each of the 5 original pages
  2. Take comparison screenshots at 1920x1080
  3. Save to: .sisyphus/evidence/final/
  4. Verify RTL: Switch language → check direction="rtl"
  ```

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Key Files | Verification |
|------------|---------|-----------|--------------|
| 2 | `chore(test): setup Vitest test infrastructure` | vitest.config.ts, package.json | `npm run test` |
| 3 | `feat(theme): design new TVTC-inspired color palette` | colorPalette.ts | `npm run build` |
| 4 | `feat(theme): create unified MUI theme` | fahrasTheme.ts | `npm run build` |
| 5 | `refactor(theme): integrate unified theme, remove old system` | App.tsx, ThemeContext.tsx, deleted files | `npm run build` |
| 6 | `feat(legal): add placeholder ToS and Privacy Policy` | TermsOfServicePage.tsx, PrivacyPolicyPage.tsx, router.tsx | `npm run build` |
| 7 | `fix(ui): remediate Homepage/Explore issues` | ExplorePage.tsx, ProjectGrid*.tsx | `npm run build` |
| 8 | `fix(auth): remediate Login page accessibility` | LoginPage.tsx | `npm run build` |
| 9 | `fix(auth): remediate Register page, add password features` | RegisterPage.tsx | `npm run build` |
| 10 | `fix(projects): remediate Project Detail page` | ProjectDetailPage.tsx | `npm run build` |
| 11 | `fix(auth): migrate remaining auth pages to tokens` | ForgotPassword, ResetPassword, EmailVerification | `npm run build` |
| 12 | `fix(projects): migrate project forms to tokens` | CreateProjectPage, EditProjectPage | `npm run build` |
| 13 | `fix(dashboard): migrate dashboards to unified theme` | DashboardPage.tsx, variants | `npm run build` |
| 14 | `fix(features): migrate Follow/Milestone/Repo to tokens` | Feature page files | `npm run build` |
| 15 | `fix(admin): migrate admin pages to tokens` | Admin page files | `npm run build` |
| 16 | `fix(components): migrate shared components to tokens` | Layout, shared components | `npm run build` |
| 21 | `fix(ui): address testing-discovered issues` | Varies | `npm run build && lint` |

---

## Success Criteria

### Verification Commands
```bash
docker compose exec node npm run build    # Expected: Exit code 0
docker compose exec node npm run lint     # Expected: Exit code 0
docker compose exec node npm run test     # Expected: All tests pass
# ast_grep_search for hex colors          # Expected: Zero matches in .tsx files
```

### Final Checklist
- [ ] All "Must Have" present (unified theme, proper labels, password toggles, aria-labels, 44px touch targets, RTL preserved)
- [ ] All "Must NOT Have" absent (no dark mode, no old theme imports, no hardcoded colors, no backend changes)
- [ ] All 52+ reported issues addressed
- [ ] All 462+ hardcoded colors migrated to theme tokens
- [ ] All 17 authenticated pages tested with Playwright
- [ ] ToS and Privacy placeholder pages accessible
- [ ] Build, lint, and test all pass
- [ ] RTL support verified
- [ ] Screenshots captured for all pages
