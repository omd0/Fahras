# Fahras: Full-Stack Next.js 16 Migration

## TL;DR

> **Quick Summary**: Migrate the entire Fahras graduation project archiving system from Laravel 11 API + React 19 SPA into a single full-stack **Next.js 16** application. Eliminate the PHP backend entirely — Next.js App Router for the frontend, API routes for the backend, Prisma for the database, NextAuth v5 for auth, AWS S3 for file storage.
>
> **Deliverables**:
> - Complete Next.js 16 App Router application with 33 page routes
> - 92 API route handlers (replacing all Laravel controllers)
> - Prisma schema covering 31 database tables
> - NextAuth v5 authentication (credentials + email verification + magic links)
> - AWS S3 file management
> - AI analysis service (Gemini/OpenAI/Claude)
> - Full MUI v7 UI migration with RTL/Arabic support
> - CranL PaaS deployment configuration
>
> **Estimated Effort**: XL (37 tasks across 8 waves)
> **Parallel Execution**: YES — 8 waves
> **Critical Path**: Task 1 → Task 4 → Task 10 → Task 19 → Task 23 → Task 37

---

## Next.js 16 Specifics (CRITICAL — Read First)

> **This plan targets Next.js 16**, which has significant differences from Next.js 15:
>
> | Feature | Next.js 15 | Next.js 16 |
> |---------|-----------|-----------|
> | **Bundler** | Turbopack opt-in (`--turbopack`) | **Turbopack by default** (no flag needed) |
> | **Route protection** | `middleware.ts` / `middleware()` | **`proxy.ts`** / **`proxy()`** |
> | **Proxy runtime** | Edge Runtime | **Node.js runtime** (full Node.js APIs) |
> | **Config: bundler** | `experimental: { turbopack: {} }` | Top-level **`turbopack: {}`** |
> | **Config: caching** | `experimental: { dynamicIO: true }` | Top-level **`cacheComponents: true`** |
> | **Linting** | `next lint` command | **ESLint CLI directly** (`npx eslint .`) |
> | **APIs** | `unstable_*` prefix | Prefix removed (stabilized) |
> | **PPR** | `experimental_ppr` segment config | Use **`cacheComponents`** config instead |
>
> **All tasks MUST follow Next.js 16 conventions. No Next.js 15 patterns.**

---

## Context

### Original Request
"REFACTOR CODE TO NEXT JS NO BACKEND FRONTEND ONLY ONE APP" — User wants a pure Next.js stack, single codebase, single deployment. "Nothing but Next.js."

### Interview Summary
**Key Discussions**:
- Architecture: Full-stack Next.js 16 with App Router — API routes replace all Laravel controllers
- Database: Fresh PostgreSQL on CranL (not connecting to existing database)
- ORM: Prisma (replacing Eloquent)
- Auth: NextAuth.js v5 with Credentials provider (replacing Sanctum)
- Storage: AWS S3 only (no MinIO, GCS, Azure, or Dropbox)
- UI: Keep MUI v7 as-is — all pages use `'use client'` directive
- Cache: Redis managed on CranL
- Tests: LSP check only (TypeScript type-checking + ESLint). No unit/integration tests.
- Dead features: Evaluations, Approvals, AI Search Controller → keep as TODO stub files only
- Feature scope: Migrate EVERYTHING with full parity
- Deployment: CranL PaaS (GitHub auto-deploy, MENA region, managed DBs)

**Research Findings**:
- CranL PaaS: Full Node.js server (not serverless), managed PostgreSQL + Redis, GitHub auto-deploy, MENA/Saudi Arabia region, CDN, SSL, DDoS protection
- No serverless limitations: persistent DB connections OK, long-running AI jobs OK, no function timeouts
- MUI v7 + Next.js: All MUI components require `'use client'` — no Server Components benefit for UI pages
- Current app scope: 122 frontend files (~45K LOC), 12 controllers, 25 models, 31 tables, 92 API endpoints
- Next.js 16: `proxy.ts` replaces `middleware.ts`, Turbopack default, Node.js runtime for proxy, `cacheComponents` config

### Metis Review
**Identified Gaps** (addressed):
- Dead Evaluation/Approval routes (no backend implementation) → user chose: TODO stubs with empty files
- AI Search Controller not wired to frontend → include as TODO stub
- Email not actually sending (console.log only) → preserve this behavior, console.log for now
- Password hashing compatibility → not needed since fresh database (bcryptjs for new passwords)
- Case-insensitive email queries → use Prisma `mode: 'insensitive'`
- AI job queue → run inline since CranL is not serverless (no timeout limits)
- `personal_access_tokens` table conflicts with NextAuth → use JWT strategy, skip NextAuth's DB tables
- File streaming for large downloads → use Node.js streams with S3 `GetObjectCommand`

---

## Work Objectives

### Core Objective
Migrate Fahras from a Laravel 11 + React 19 dual-service architecture to a single full-stack Next.js 16 application deployed on CranL PaaS, achieving complete feature parity with the existing system.

### Concrete Deliverables
- `app/` — Next.js 16 App Router with 33 page routes + 30 API route files
- `prisma/schema.prisma` — Complete database schema (31 models)
- `prisma/seed.ts` — Seed script for roles, permissions, departments, programs, milestone templates
- `src/lib/` — Prisma client, NextAuth config, S3 client, AI analysis service, API service
- `src/features/` — All 10 feature modules migrated
- `src/components/` — All 45+ shared components migrated
- `proxy.ts` — Route protection (**Next.js 16 proxy**, NOT middleware)
- `Dockerfile` — CranL deployment configuration
- `.env.example` — All required environment variables documented

### Definition of Done
- [ ] `npm run build` exits with code 0 (zero errors, Turbopack default)
- [ ] `npx tsc --noEmit` exits with code 0 (zero type errors)
- [ ] `npx eslint .` exits with code 0 (ESLint CLI directly, NOT `next lint`)
- [ ] All 33 page routes render without errors
- [ ] All API routes return expected response shapes (verified via curl)
- [ ] Auth flow works end-to-end (register → login → protected route → logout)
- [ ] File upload/download works with S3
- [ ] Project CRUD works (create → read → update → delete)
- [ ] Prisma seed populates all reference data

### Must Have
- Next.js **16** with App Router and **Turbopack** (default bundler)
- **`proxy.ts`** for route protection (NOT `middleware.ts`)
- All 33 page routes from current React Router config
- All 92 API endpoints from current Laravel routes
- NextAuth v5 with credentials provider
- Email verification (OTP + magic link) — console.log, not actual email sending
- Password reset flow — console.log, not actual email sending
- RBAC with 4 roles and scoped permissions
- Full Arabic/RTL support (LanguageContext + translations.ts)
- MUI v7 theme with current color palette and design tokens
- Slug-based project URLs (`/pr/[slug]`)
- Guest access to public projects (optional auth via proxy)
- Bookmark system with guest cookie sync
- Project file upload/download via S3
- AI analysis service (Gemini/OpenAI/Claude + fallback keyword extraction)
- Full-text search on projects
- Zustand stores (auth, repository, theme) — preserved as-is
- Command palette (Cmd+K)
- Activity feed and milestone tracking
- Notification polling (30-second interval)

### Must NOT Have (Guardrails)
- ~~`middleware.ts`~~ — **Use `proxy.ts` (Next.js 16)**
- ~~`next lint`~~ — **Use ESLint CLI directly (Next.js 16)**
- ~~`--turbopack` flag~~ — **Turbopack is default in Next.js 16**
- ~~`experimental.turbopack`~~ — **Use top-level `turbopack: {}` config**
- ~~`experimental.dynamicIO`~~ — **Use `cacheComponents: true`**
- ~~Edge Runtime for proxy~~ — **Node.js runtime only (Next.js 16)**
- OAuth/social login providers (Google, GitHub, etc.)
- WebSocket or Server-Sent Events (keep polling)
- next-intl or any i18n framework (keep custom LanguageContext)
- Server Components for MUI pages (use `'use client'` everywhere)
- Unit/integration/E2E tests (LSP check only)
- API versioning (`/v1/`, `/v2/`)
- Rate limiting middleware
- Multi-provider cloud storage (S3 only)
- Evaluation/Approval backend logic (TODO stubs only)
- AI Search controller backend logic (TODO stubs only)
- Real email sending (console.log only)
- Analytics/monitoring instrumentation (Sentry, etc.)
- CI/CD pipeline configuration
- Docker development environment (CranL handles deployment)
- Custom webpack configuration (Turbopack is default)
- Vercel-specific features (Edge Runtime, ISR, etc.)
- Pages Router (App Router only)

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**

### Test Decision
- **Infrastructure exists**: NO (fresh project)
- **Automated tests**: NONE (user chose LSP check only)
- **Framework**: N/A
- **Verification**: TypeScript compilation (`tsc --noEmit`), ESLint CLI, curl-based API smoke tests, Playwright for UI

### Build Verification (ALL tasks)
```bash
npm run build                    # Turbopack (Next.js 16 default) — Must exit 0
npx tsc --noEmit                 # Type checking — Must exit 0
npx eslint . --max-warnings 0   # ESLint CLI (NOT next lint) — Must exit 0
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Initialize Next.js 16 project
├── Task 2: Prisma schema (31 tables)
└── Task 3: MUI theme + providers + i18n

Wave 2 (After Wave 1):
├── Task 4: NextAuth v5 setup
├── Task 5: Auth API routes (register, login, verify, reset)
└── Task 6: RBAC utilities + permission constants

Wave 3 (After Wave 2 — API routes in parallel):
├── Task 7: Academic structure + Tags API
├── Task 8: User management + Roles/Permissions API
├── Task 9: Project search + analytics API
├── Task 10: Project CRUD API
├── Task 11: File management API (S3)
├── Task 12: Comments, Ratings, Bookmarks API
├── Task 13: Notifications API
├── Task 14: Milestones API (templates + project milestones)
├── Task 15: Project Follow API (activities, flags, followers)
└── Task 16: Saved Searches API

Wave 4 (After Wave 2 — parallel with Wave 3):
├── Task 17: App Router layout (Header, Nav, MobileDrawer, UtilityBar)
├── Task 18: Auth pages (Login, Register, ForgotPassword, ResetPassword, EmailVerify)
└── Task 19: Next.js 16 proxy.ts for route protection

Wave 5 (After Wave 3 + 4):
├── Task 20: Home/Landing page
├── Task 21: Explore page (search, filters, grid/table)
├── Task 22: Project Detail page (unified guest + auth)
├── Task 23: Create/Edit Project pages
└── Task 24: Profile/Settings pages

Wave 6 (After Wave 5 — parallel):
├── Task 25: Dashboard pages (5 role-based)
├── Task 26: Milestone Template config page
├── Task 27: Notifications + Bookmarks pages
├── Task 28: Access Control page (RBAC admin)
├── Task 29: Repository Viewer page
└── Task 30: Project Follow page

Wave 7 (After Wave 6):
├── Task 31: AI Analysis service
├── Task 32: TODO stub pages (Evaluations, Approvals, AI Search)
├── Task 33: Shared components finalization (CommandPalette, ErrorBoundary, Skeletons)
└── Task 34: Static pages (Terms, Privacy, PublicDashboard)

Wave 8 (Final):
├── Task 35: Database seeding (seed.ts)
├── Task 36: CranL deployment config (Dockerfile, .env.example)
└── Task 37: Final QA verification
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2,3,4,5,6 | 2, 3 |
| 2 | None | 4,5,6,7-16,35 | 1, 3 |
| 3 | None | 17,18,20-34 | 1, 2 |
| 4 | 1,2 | 5,6,18,19 | - |
| 5 | 4 | 7-16 | 6 |
| 6 | 4 | 7-16,19 | 5 |
| 7-16 | 5,6 | 20-30 | Each other |
| 17 | 3 | 20-34 | 18,19 |
| 18 | 3,4 | 20-34 | 17,19 |
| 19 | 4,6 | 20-34 | 17,18 |
| 20-24 | 17,Wave3 | 25-30 | Each other |
| 25-30 | Wave5 | 31-34 | Each other |
| 31-34 | Wave6 | 35 | Each other |
| 35 | 2 | 36 | 31-34 |
| 36 | 35 | 37 | - |
| 37 | All | None | - |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2, 3 | category="unspecified-high", parallel |
| 2 | 4, 5, 6 | category="deep", sequential (4 first, then 5+6 parallel) |
| 3 | 7-16 | category="quick" each, all parallel |
| 4 | 17, 18, 19 | category="visual-engineering" (17,18), category="quick" (19), parallel |
| 5 | 20-24 | category="visual-engineering" each, parallel |
| 6 | 25-30 | category="visual-engineering" each, parallel |
| 7 | 31-34 | category="unspecified-low" each, parallel |
| 8 | 35, 36, 37 | category="quick" (35,36), category="deep" (37), sequential |

---

## Project Structure

```
/home/omd/Documents/CTI/Fahras/
├── api/                          # OLD — Laravel backend (keep as reference, delete after migration)
├── web/                          # OLD — React frontend (keep as reference, delete after migration)
├── app/                          # NEW — Next.js 16 App Router
│   ├── layout.tsx
│   ├── page.tsx                  # / (Home)
│   ├── explore/page.tsx
│   ├── home/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── verify-email/page.tsx
│   ├── bookmarks/page.tsx
│   ├── terms/page.tsx
│   ├── privacy/page.tsx
│   ├── dashboard/page.tsx
│   ├── analytics/page.tsx
│   ├── profile/page.tsx
│   ├── settings/page.tsx
│   ├── notifications/page.tsx
│   ├── users/page.tsx
│   ├── access-control/page.tsx
│   ├── milestone-templates/page.tsx
│   ├── evaluations/page.tsx      # TODO stub
│   ├── approvals/page.tsx        # TODO stub
│   ├── admin/approvals/page.tsx  # TODO stub
│   ├── faculty/pending-approvals/page.tsx  # TODO stub
│   ├── student/my-projects/page.tsx
│   ├── pr/
│   │   ├── create/page.tsx
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       ├── edit/page.tsx
│   │       ├── follow/page.tsx
│   │       └── code/
│   │           ├── page.tsx
│   │           └── [...path]/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── register/route.ts
│       ├── login/route.ts
│       ├── logout/route.ts
│       ├── logout-all/route.ts
│       ├── refresh/route.ts
│       ├── user/route.ts
│       ├── profile/route.ts
│       ├── profile/avatar/route.ts
│       ├── change-password/route.ts
│       ├── email/
│       │   ├── send-verification/route.ts
│       │   ├── verify/route.ts
│       │   └── verify-magic/[token]/route.ts
│       ├── forgot-password/route.ts
│       ├── reset-password/route.ts
│       ├── projects/
│       │   ├── route.ts
│       │   ├── analytics/route.ts
│       │   ├── suggestions/route.ts
│       │   ├── admin/route.ts
│       │   └── [slug]/
│       │       ├── route.ts
│       │       ├── files/route.ts
│       │       ├── comments/route.ts
│       │       ├── ratings/route.ts
│       │       ├── bookmark/route.ts
│       │       ├── milestones/route.ts
│       │       ├── activities/route.ts
│       │       ├── timeline/route.ts
│       │       ├── follow/route.ts
│       │       ├── followers/route.ts
│       │       ├── flags/route.ts
│       │       ├── approve/route.ts
│       │       ├── hide/route.ts
│       │       └── visibility/route.ts
│       ├── files/[id]/
│       │   └── download/route.ts
│       ├── admin/
│       │   └── users/
│       │       ├── route.ts
│       │       └── [id]/
│       │           ├── route.ts
│       │           └── toggle-status/route.ts
│       ├── roles/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── permissions/route.ts
│       ├── notifications/
│       │   ├── route.ts
│       │   ├── unread-count/route.ts
│       │   ├── mark-all-read/route.ts
│       │   ├── delete-all/route.ts
│       │   └── [id]/
│       │       ├── read/route.ts
│       │       └── route.ts
│       ├── programs/route.ts
│       ├── departments/route.ts
│       ├── tags/route.ts
│       ├── milestone-templates/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── reorder/route.ts
│       ├── milestones/[id]/
│       │   ├── route.ts
│       │   ├── start/route.ts
│       │   ├── complete/route.ts
│       │   ├── reopen/route.ts
│       │   └── due-date/route.ts
│       ├── saved-searches/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── usage/route.ts
│       │       └── default/route.ts
│       ├── bookmarks/
│       │   ├── route.ts
│       │   └── sync/route.ts
│       └── search-queries/route.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── auth-helpers.ts
│   │   ├── s3.ts
│   │   ├── api.ts              # Frontend Axios API service
│   │   └── ai-analysis.ts
│   ├── middleware/
│   │   ├── auth.ts             # API route auth helpers
│   │   └── rbac.ts             # Permission checking
│   ├── features/               # Migrated from web/src/features/
│   ├── components/             # Migrated from web/src/components/
│   ├── store/                  # Zustand stores
│   ├── types/
│   ├── hooks/
│   ├── styles/
│   ├── providers/
│   ├── i18n/
│   ├── config/
│   └── utils/
├── public/                     # Static assets
├── proxy.ts                    # ⚡ NEXT.JS 16: Route protection (NOT middleware.ts)
├── next.config.ts              # ⚡ NEXT.JS 16: turbopack top-level, cacheComponents
├── tsconfig.json
├── package.json
├── eslint.config.mjs           # ⚡ NEXT.JS 16: ESLint flat config (NOT .eslintrc)
├── Dockerfile
├── .env.example
└── .env.local
```

---

## TODOs

### Wave 1: Foundation

- [x] 1. Initialize Next.js 16 Project

  **What to do**:
  - Run `npx create-next-app@latest` (latest is v16.1.5) with TypeScript, App Router, ESLint, no Tailwind, src directory, import alias `@/*`
  - **CRITICAL Next.js 16 specifics**:
    - Turbopack is the DEFAULT bundler — do NOT add `--turbopack` flag to scripts
    - Remove any `--turbopack` or `--turbo` flags from package.json scripts
    - ESLint uses flat config (`eslint.config.mjs`) — NOT `.eslintrc.json`
    - Do NOT use `next lint` — use `npx eslint .` directly
  - Configure `next.config.ts` (**Next.js 16 format**):
    ```typescript
    import type { NextConfig } from 'next'
    const nextConfig: NextConfig = {
      output: 'standalone',           // For Docker/CranL deployment
      cacheComponents: true,          // Next.js 16 caching (replaces experimental.dynamicIO)
      turbopack: {},                  // Next.js 16 top-level (replaces experimental.turbopack)
    }
    export default nextConfig
    ```
  - Install core dependencies:
    - `@mui/material @mui/icons-material @emotion/react @emotion/styled @emotion/cache` (MUI v7)
    - `zustand` (state management)
    - `axios` (HTTP client)
    - `prisma @prisma/client` (database ORM)
    - `next-auth@beta` (Auth.js v5)
    - `@aws-sdk/client-s3 @aws-sdk/s3-request-presigner` (file storage)
    - `bcryptjs` (password hashing)
    - `framer-motion` (animations)
    - `react-window` (virtual scrolling)
    - `cmdk` (command palette)
    - `js-yaml` (YAML parsing)
    - `stylis stylis-plugin-rtl` (RTL support)
    - `crypto-js` (hashing utilities)
  - Install dev dependencies: `@types/bcryptjs @types/js-yaml tsx`
  - Configure `tsconfig.json`: paths alias `@/*` pointing to `./src/*`
  - Create `.env.example` with ALL environment variables
  - Create `src/lib/prisma.ts` — Prisma client singleton

  **Must NOT do**:
  - Do NOT install Tailwind CSS
  - Do NOT install next-intl or react-intl
  - Do NOT use Pages Router
  - Do NOT install testing frameworks
  - Do NOT delete `/api/` or `/web/` directories
  - Do NOT use `experimental.turbopack` — use top-level `turbopack: {}`
  - Do NOT create `middleware.ts` — Next.js 16 uses `proxy.ts`
  - Do NOT add custom webpack configuration (Turbopack is default)
  - Do NOT use `next lint` command — use ESLint CLI directly

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Project scaffolding with Next.js 16 specific configuration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 4, 5, 6, 17, 18, 19
  - **Blocked By**: None

  **References**:
  - `web/package.json` — Current dependency list with versions to match
  - `web/tsconfig.json` — TypeScript config (path aliases)
  - `api/.env` or `api/.env.example` — Backend env vars for API routes
  - Next.js 16 upgrade guide: https://nextjs.org/docs/app/guides/upgrading/version-16
  - Next.js 16 `cacheComponents`: https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents

  **Acceptance Criteria**:
  - [ ] `npm run build` exits with code 0 (Turbopack, no flags)
  - [ ] `npx tsc --noEmit` exits with code 0
  - [ ] `npx eslint .` exits with code 0 (ESLint CLI, NOT `next lint`)
  - [ ] `npm run dev` starts dev server on localhost:3000 (Turbopack auto)
  - [ ] `next.config.ts` has `cacheComponents: true` and `turbopack: {}` at top level
  - [ ] No `experimental.turbopack` or `experimental.dynamicIO` in config
  - [ ] No `middleware.ts` file exists
  - [ ] `.env.example` contains all required variables

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Dev server starts with Turbopack (default)
    Tool: Bash
    Steps:
      1. npm run dev &
      2. Wait 10s
      3. curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
      4. Assert: HTTP status is 200
      5. Check dev output contains "Turbopack" or no webpack references
    Expected Result: Turbopack dev server running
  ```

  **Commit**: YES
  - Message: `feat: initialize Next.js 16 project with Turbopack and core dependencies`

---

- [x] 2. Prisma Schema — Complete Database Definition

  **What to do**:
  - Create `prisma/schema.prisma` with `postgresql` provider
  - Define ALL 31 models matching current Laravel migrations:
    - **Auth**: User, Role, Permission, RoleUser, PermissionRole, PersonalAccessToken, EmailVerification, PasswordResetToken, Session
    - **Academic**: Department, Program, Faculty, Student
    - **Projects**: Project, ProjectMember, ProjectAdvisor, File, Comment, Rating, Bookmark, Tag, ProjectTag
    - **Milestones**: MilestoneTemplate, MilestoneTemplateItem, ProjectMilestone
    - **Activity**: ProjectActivity, ProjectFollower, ProjectFlag
    - **Search**: SavedSearch, SearchQuery
    - **AI**: ProjectAiMetadata
    - **Notifications**: Notification
  - Use Prisma `enum` for all 14+ enum types
  - Use `@map` for snake_case DB columns with camelCase TypeScript properties
  - Use `@@map` for snake_case table names
  - Add ALL indexes, unique constraints, and cascading foreign keys
  - Run `npx prisma generate`

  **Must NOT do**:
  - Do NOT change column names from Laravel migrations — use `@map("snake_case")`
  - Do NOT skip any table or column
  - Do NOT use `prisma migrate dev` yet (just `generate`)

  **Recommended Agent Profile**: **Category**: `unspecified-high` | **Skills**: []

  **Parallelization**: Wave 1 (parallel with Tasks 1, 3) | **Blocked By**: None

  **References**:
  - `api/database/migrations/` — ALL 22 migration files (source of truth for every column, type, default, constraint)
  - `api/app/Models/` — ALL 25 model files (relationships, scopes, accessors)
  - `api/app/Domains/Projects/Models/` — Domain model files
  - `web/src/types/index.ts` — Frontend TypeScript interfaces
  - `web/src/types/milestones.ts` — Milestone types

  **Acceptance Criteria**:
  - [ ] `npx prisma generate` exits with code 0
  - [ ] `grep -c "^model " prisma/schema.prisma` ≥ 25
  - [ ] All enum types defined (14+)
  - [ ] All `@@index`, `@@unique` constraints match Laravel migrations
  - [ ] JSON columns use `Json` type

  **Commit**: YES — `feat: define complete Prisma schema with 31 models`

---

- [x] 3. MUI Theme + Providers + i18n Setup

  **What to do**:
  - Copy from `web/src/styles/` → `src/styles/`: fahrasTheme.ts, colorPalette.ts, designTokens.ts, accessibility.css
  - Copy from `web/src/providers/` → `src/providers/`: ThemeContext.tsx (add `'use client'`), LanguageContext.tsx (add `'use client'`)
  - Copy `web/src/i18n/translations.ts` → `src/i18n/translations.ts`
  - Copy `web/src/config/` → `src/config/`: organization.ts, dashboardThemes.ts
  - Create `app/layout.tsx` — Root layout with ThemeProvider, LanguageProvider, Emotion cache for SSR with RTL
  - Create `src/providers/EmotionCacheProvider.tsx` — Emotion cache for Next.js (prevent FOUC)
  - Replace `import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*`

  **Must NOT do**: Do NOT install next-intl. Do NOT change colors/tokens. Do NOT modify translations.

  **Recommended Agent Profile**: **Category**: `visual-engineering` | **Skills**: [`frontend-ui-ux`]

  **Parallelization**: Wave 1 (parallel with Tasks 1, 2) | **Blocked By**: None

  **References**:
  - `web/src/styles/theme/fahrasTheme.ts` — Complete MUI theme
  - `web/src/providers/ThemeContext.tsx`, `LanguageContext.tsx` — Providers
  - `web/src/i18n/translations.ts` — 300+ translation strings
  - MUI + Next.js App Router: https://mui.com/material-ui/integrations/nextjs/

  **Acceptance Criteria**:
  - [ ] `npm run build` exits with code 0
  - [ ] Root layout renders with MUI theme
  - [ ] RTL direction applied for Arabic
  - [ ] All 300+ translation keys preserved
  - [ ] No `import.meta.env` references remain

  **Commit**: YES — `feat: setup MUI v7 theme, providers, i18n, RTL support`

---

### Wave 2: Authentication System

- [x] 4. NextAuth v5 Setup + Credentials Provider

  **What to do**:
  - Create `src/lib/auth.ts` — NextAuth v5 config: Credentials provider, JWT strategy, bcryptjs comparison, case-insensitive email, JWT callbacks with user.id/roles/permissions
  - Create `app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
  - Create `src/lib/auth-helpers.ts` — requireAuth(), requireRole(), optionalAuth(), hashPassword(), verifyPassword()
  - Create `src/middleware/auth.ts` — API route auth helpers

  **Must NOT do**: No OAuth. No NextAuth DB adapter (JWT only). No localStorage tokens. Keep bcrypt 12 rounds.

  **Recommended Agent Profile**: **Category**: `deep` | **Skills**: []

  **Parallelization**: Sequential (must complete before 5, 6) | **Blocked By**: Tasks 1, 2

  **References**:
  - `api/app/Http/Controllers/AuthController.php` — Login/register logic
  - `api/app/Models/User.php` — User model with roles
  - `web/src/lib/api.ts:login()` — Frontend expects `{ user, token }`
  - `web/src/features/auth/store.ts` — Auth state management

  **Acceptance Criteria**:
  - [ ] NextAuth route handler at `app/api/auth/[...nextauth]/route.ts`
  - [ ] JWT includes user.id, user.roles, user.permissions
  - [ ] auth-helpers exports: requireAuth, requireRole, optionalAuth, hashPassword, verifyPassword

  **Commit**: YES — `feat: setup NextAuth v5 with credentials provider and JWT`

---

- [x] 5. Auth API Routes (Register, Login, Email Verify, Password Reset) [PARTIAL: 3/14]

  **What to do**:
  - Create all 14 auth route files:
    - `app/api/register/route.ts` — POST: register with auto-role by email domain
    - `app/api/login/route.ts` — POST: login with case-insensitive email, return `{ user, token }`
    - `app/api/logout/route.ts`, `logout-all/route.ts` — POST: invalidate sessions
    - `app/api/refresh/route.ts` — POST: refresh JWT
    - `app/api/user/route.ts` — GET: authenticated user with roles/permissions
    - `app/api/profile/route.ts` — PUT: update profile
    - `app/api/profile/avatar/route.ts` — POST: upload avatar, DELETE: remove
    - `app/api/change-password/route.ts` — POST: change password
    - `app/api/email/send-verification/route.ts` — POST: generate OTP + magic link (console.log)
    - `app/api/email/verify/route.ts` — POST: verify OTP
    - `app/api/email/verify-magic/[token]/route.ts` — GET: verify magic link
    - `app/api/forgot-password/route.ts` — POST: generate reset token (console.log)
    - `app/api/reset-password/route.ts` — POST: validate token, update password

  **Must NOT do**: No real email sending (console.log only). No rate limiting. No OAuth. Keep exact response shapes.

  **Recommended Agent Profile**: **Category**: `deep` | **Skills**: []

  **Parallelization**: Wave 2 (parallel with Task 6) | **Blocked By**: Task 4

  **References**:
  - `api/app/Http/Controllers/AuthController.php` — ALL auth methods
  - `api/app/Models/EmailVerification.php` — OTP/magic link handling
  - `web/src/lib/api.ts` — All auth API calls with request/response shapes
  - `web/src/features/auth/store.ts` — How frontend processes auth responses

  **Acceptance Criteria**:
  - [ ] All 14 auth route files exist
  - [ ] Register creates user with auto-assigned role
  - [ ] Login returns `{ user, token }` with roles populated
  - [ ] Wrong password returns 401

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Register and Login flow
    Tool: Bash (curl)
    Steps:
      1. POST /api/register with test data → Assert 201, non-null token
      2. POST /api/login with credentials → Assert 200, non-null token
      3. POST /api/login with wrong password → Assert 401
  ```

  **Commit**: YES — `feat: implement auth API routes`

---

- [x] 6. RBAC Middleware + Permission Utilities

  **What to do**:
  - Create `src/middleware/rbac.ts`: checkPermission(), checkRole(), isAdmin(), isFaculty(), isStudent(), isReviewer(), getPermissionScope(), filterByScope()
  - Create `src/constants/`: approval-status.ts, project-status.ts, member-role.ts, advisor-role.ts, permissions.ts

  **Recommended Agent Profile**: **Category**: `quick` | **Skills**: []

  **Parallelization**: Wave 2 (parallel with Task 5) | **Blocked By**: Task 4

  **References**:
  - `api/app/Services/PermissionService.php` — Permission checking with scope logic
  - `api/app/Constants/` — All constant/enum files
  - `api/database/seeders/PermissionSeeder.php` — All permission codes

  **Acceptance Criteria**:
  - [x] All RBAC functions exported and type-safe
  - [x] All constants match Laravel values

  **Commit**: YES — `feat: implement RBAC middleware and permission utilities`

---

### Wave 3: Core API Routes (ALL parallel)

- [x] 7. Academic Structure + Tags API

  **What to do**: Create `app/api/programs/route.ts` (GET), `app/api/departments/route.ts` (GET), `app/api/tags/route.ts` (GET, POST)

  **Recommended Agent Profile**: **Category**: `quick` | **Skills**: []
  **Parallelization**: Wave 3 (parallel) | **Blocked By**: Tasks 5, 6
  **References**: `api/routes/api.php`, `api/app/Http/Controllers/TagController.php`, `web/src/lib/api.ts`
  **Acceptance Criteria**: GET endpoints return JSON arrays
  **Commit**: YES (groups with Wave 3)

---

- [x] 8. User Management + Roles/Permissions API

  **What to do**: Create `app/api/admin/users/` (GET paginated, POST create), `app/api/admin/users/[id]/` (PUT, DELETE), `app/api/admin/users/[id]/toggle-status/` (POST), `app/api/roles/` (GET, POST), `app/api/roles/[id]/` (PUT, DELETE), `app/api/permissions/` (GET)

  **Recommended Agent Profile**: **Category**: `quick` | **Skills**: []
  **Parallelization**: Wave 3 (parallel) | **Blocked By**: Tasks 5, 6
  **References**: `api/app/Http/Controllers/UserController.php`, `api/app/Http/Controllers/RoleController.php`, `web/src/lib/api.ts`
  **Acceptance Criteria**: Admin CRUD works, non-admin gets 403
  **Commit**: YES (groups with Wave 3)

---

- [x] 9. Project Search + Analytics API

  **What to do**: Create `app/api/projects/route.ts` (GET: paginated search with filters, full-text search), `app/api/projects/analytics/route.ts` (GET), `app/api/projects/suggestions/route.ts` (GET), `app/api/projects/admin/route.ts` (GET), `app/api/search-queries/route.ts` (POST). Implement PostgreSQL full-text search. Support optional auth (guest access).

  **Recommended Agent Profile**: **Category**: `unspecified-high` | **Skills**: []
  **Parallelization**: Wave 3 (parallel) | **Blocked By**: Tasks 5, 6
  **References**: `api/app/Domains/Projects/Controllers/ProjectController.php` (index, searchProjects, analytics, suggestions), `web/src/lib/api.ts`, `web/src/features/projects/pages/ExplorePage.tsx`, `web/src/components/explore/AdvancedFilters.tsx`
  **Acceptance Criteria**: Paginated response `{ data, current_page, last_page, total }`, search filters work, unauthenticated returns public-only
  **Commit**: YES (groups with Wave 3)

---

- [x] 10. Project CRUD API

  **What to do**: Extend `app/api/projects/route.ts` (POST: create with members/advisors/tags, 6-char slug). Create `app/api/projects/[slug]/route.ts` (GET with relations, PUT, DELETE). Create approve/hide/visibility routes. Use Prisma transactions for creation.

  **Recommended Agent Profile**: **Category**: `unspecified-high` | **Skills**: []
  **Parallelization**: Wave 3 (parallel) | **Blocked By**: Tasks 5, 6
  **References**: `api/app/Domains/Projects/Controllers/ProjectController.php`, `api/app/Domains/Projects/Services/ProjectService.php`, `api/app/Domains/Projects/Models/Project.php`, `web/src/lib/api.ts`, `web/src/types/index.ts`
  **Acceptance Criteria**: CRUD works, slug is 6-char unique, transactions work, creator/admin-only edits
  **Commit**: YES (groups with Wave 3)

---

- [x] 11. File Management API (S3)

  **What to do**: Create `src/lib/s3.ts` (S3 client: upload, download stream, delete, presign). Create `app/api/projects/[slug]/files/route.ts` (GET list, POST upload with UUID, SHA256). Create `app/api/files/[id]/download/route.ts` (GET stream, RFC 5987 Content-Disposition for Arabic). Create `app/api/files/[id]/route.ts` (DELETE).

  **Must NOT do**: No buffering entire file. No GCS/Azure/Dropbox. Stream downloads.

  **Recommended Agent Profile**: **Category**: `unspecified-high` | **Skills**: []
  **Parallelization**: Wave 3 (parallel) | **Blocked By**: Tasks 5, 6
  **References**: `api/app/Http/Controllers/FileController.php`, `api/app/Models/File.php`, `web/src/lib/api.ts`
  **Acceptance Criteria**: Upload creates S3 object + DB record, download streams, Arabic filenames work
  **Commit**: YES (groups with Wave 3)

---

- [x] 12. Comments, Ratings, Bookmarks API

  **What to do**: Create comments (GET threaded, POST), ratings (GET with average, POST unique per user), bookmark toggle, bookmarks list, guest bookmark sync routes.

  **Recommended Agent Profile**: **Category**: `quick` | **Skills**: []
  **Parallelization**: Wave 3 (parallel) | **Blocked By**: Tasks 5, 6
  **References**: `api/app/Domains/Projects/Controllers/ProjectController.php`, `api/app/Models/Comment.php`, `api/app/Models/Rating.php`, `web/src/utils/bookmarkCookies.ts`
  **Acceptance Criteria**: Threading works, one rating per user, bookmark sync reads cookies
  **Commit**: YES (groups with Wave 3)

---

- [x] 13. Notifications API

  **What to do**: Create notifications CRUD (GET paginated, unread count, mark read, mark all read, delete, delete all).

  **Recommended Agent Profile**: **Category**: `quick` | **Skills**: []
  **Parallelization**: Wave 3 (parallel) | **Blocked By**: Tasks 5, 6
  **References**: `api/app/Http/Controllers/NotificationController.php`, `web/src/lib/api.ts`
  **Acceptance Criteria**: All CRUD operations work for authenticated user
  **Commit**: YES (groups with Wave 3)

---

- [x] 14. Milestones API

  **What to do**: Create milestone templates (CRUD, reorder), project milestones (CRUD, apply template, status transitions, due dates, timeline).

  **Recommended Agent Profile**: **Category**: `quick` | **Skills**: []
  **Parallelization**: Wave 3 (parallel) | **Blocked By**: Tasks 5, 6
  **References**: `api/app/Http/Controllers/MilestoneTemplateController.php`, `api/app/Http/Controllers/MilestoneController.php`, `api/app/Services/MilestoneTemplateService.php`, `web/src/types/milestones.ts`
  **Acceptance Criteria**: Template CRUD (admin), apply template creates milestones, status transitions work
  **Commit**: YES (groups with Wave 3)

---

- [x] 15. Project Follow API (Activities, Flags, Followers)

  **What to do**: Create activities (GET paginated), timeline (GET), follow/unfollow, followers list, flags (GET, POST, resolve).

  **Recommended Agent Profile**: **Category**: `quick` | **Skills**: []
  **Parallelization**: Wave 3 (parallel) | **Blocked By**: Tasks 5, 6
  **References**: `api/app/Domains/Projects/Controllers/ProjectFollowController.php`, `api/app/Domains/Projects/Services/ProjectActivityService.php`
  **Acceptance Criteria**: Follow toggle, activity feed paginated, flags CRUD
  **Commit**: YES (groups with Wave 3)

---

- [x] 16. Saved Searches API

  **What to do**: Create saved searches CRUD, usage tracking, set default.

  **Recommended Agent Profile**: **Category**: `quick` | **Skills**: []
  **Parallelization**: Wave 3 (parallel) | **Blocked By**: Tasks 5, 6
  **References**: `api/app/Http/Controllers/SavedSearchController.php`, `web/src/lib/api.ts`
  **Acceptance Criteria**: CRUD works, usage count increments, one default per user
  **Commit**: YES — `feat: implement all API routes (academic, users, projects, files, milestones, notifications, search)`

---

### Wave 4: Frontend Layout + Auth Pages

- [x] 17. App Router Layout (Header, Nav, MobileDrawer, UtilityBar)

  **What to do**:
  - Migrate layout components from `web/src/components/layout/` → `src/components/layout/`: AppLayout, Header, HeaderLogo, PrimaryNav, MobileDrawer, UtilityBar, ThemeToggle, LanguageSwitcher, PageTransition
  - Update `app/layout.tsx` to include AppLayout
  - Replace React Router: `<Link>` → `next/link`, `useNavigate()` → `useRouter()`, `useLocation()` → `usePathname()`, `useParams()` → `next/navigation useParams()`
  - Add `'use client'` to ALL component files

  **Must NOT do**: No visual changes. No removing nav items. No Server Components for MUI.

  **Recommended Agent Profile**: **Category**: `visual-engineering` | **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 4 (parallel with 18, 19) | **Blocked By**: Task 3
  **References**: `web/src/components/layout/` — All layout files, `web/src/router.tsx` — Route definitions
  **Acceptance Criteria**: Header renders, mobile drawer works, language switcher toggles, all links use next/link
  **Commit**: YES — `feat: migrate layout components`

---

- [x] 18. Auth Pages (Login, Register, ForgotPassword, ResetPassword, EmailVerify)

  **What to do**: Migrate 5 auth pages + auth store + auth components (ProtectedRoute, RoleProtectedRoute, EmailVerifiedRoute, ChangePasswordForm, OTPInput, LogoutAllDevicesButton). Add `'use client'`. Replace React Router with Next.js router. Update API calls to same-origin.

  **Recommended Agent Profile**: **Category**: `visual-engineering` | **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 4 (parallel with 17, 19) | **Blocked By**: Tasks 3, 4
  **References**: `web/src/features/auth/` — All auth pages, components, store
  **Acceptance Criteria**: All 5 pages render, login redirects to dashboard, auth store persists
  **Commit**: YES — `feat: migrate auth pages`

---

- [x] 19. Next.js 16 Proxy for Route Protection

  **What to do**:
  - **CRITICAL: Create `proxy.ts` at project root (NOT `middleware.ts`)**
  - **Export function named `proxy` (NOT `middleware`)**:
    ```typescript
    export function proxy(request: Request) {
      // Route protection logic here
    }
    ```
  - **Runtime is Node.js** (NOT Edge Runtime) — full Node.js APIs available
  - Implement route protection:
    - Check NextAuth session for protected routes
    - Redirect unauthenticated to `/login`
    - Role-based route guarding (admin, faculty, student)
    - Allow public routes: `/`, `/explore`, `/login`, `/register`, etc.
    - Legacy redirects: `/projects/:id` → `/pr/:id`
  - Configure `config.matcher` to avoid API routes and static files:
    ```typescript
    export const config = {
      matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
    }
    ```

  **Must NOT do**:
  - Do NOT create `middleware.ts` — **Next.js 16 uses `proxy.ts`**
  - Do NOT export `middleware()` function — **export `proxy()`**
  - Do NOT use Edge Runtime — **proxy runs on Node.js in Next.js 16**
  - Do NOT use `NextResponse` from `next/server` for middleware — use standard Response or Next.js proxy utilities

  **Recommended Agent Profile**: **Category**: `quick` | **Skills**: []
  **Parallelization**: Wave 4 (parallel with 17, 18) | **Blocked By**: Tasks 4, 6

  **References**:
  - `web/src/router.tsx` — All route definitions with protection levels
  - `web/src/features/auth/components/ProtectedRoute.tsx` — Current auth guard
  - `web/src/features/auth/components/RoleProtectedRoute.tsx` — Current role guard
  - Next.js 16 proxy docs: https://nextjs.org/docs/app/guides/upgrading/version-16 (middleware → proxy migration)

  **Acceptance Criteria**:
  - [x] File is named `proxy.ts` (NOT `middleware.ts`)
  - [x] Exports function named `proxy` (NOT `middleware`)
  - [x] Unauthenticated `/dashboard` redirects to `/login`
  - [x] `/projects/123` redirects to `/pr/123`
  - [x] Public routes accessible without auth
  - [x] No `middleware.ts` file exists anywhere in the project

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Proxy redirects unauthenticated user
    Tool: Bash (curl)
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" -L http://localhost:3000/dashboard
      2. Assert: Final URL contains /login (redirect)
  Scenario: Public routes accessible
    Tool: Bash (curl)
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/explore
      2. Assert: HTTP status is 200
  ```

  **Commit**: YES — `feat: implement Next.js 16 proxy for route protection`

---

### Wave 5: Core Frontend Pages

- [ ] 20. Home/Landing Page

  **What to do**: Migrate `HomePage.tsx` → `app/page.tsx`. Migrate shared: HeroCarousel, SectionBand, QuickActions, PortalServiceCard, TVTCBranding, TVTCLogo.

  **Recommended Agent Profile**: **Category**: `visual-engineering` | **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 5 (parallel) | **Blocked By**: Task 17
  **References**: `web/src/pages/HomePage.tsx`, `web/src/components/shared/`
  **Acceptance Criteria**: `/` renders home with hero carousel
  **Commit**: YES — `feat: migrate home page`

---

- [ ] 21. Explore Page (Search, Filters, Grid/Table)

  **What to do**: Migrate ExplorePage + all explore components (grids, filters, saved searches, cards, skeletons). Migrate useVirtualization hook.

  **Recommended Agent Profile**: **Category**: `visual-engineering` | **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 5 (parallel) | **Blocked By**: Tasks 9, 16, 17
  **References**: `web/src/features/projects/pages/ExplorePage.tsx`, `web/src/components/explore/`, `web/src/hooks/useVirtualization.ts`
  **Acceptance Criteria**: `/explore` renders, search works, filters work, grid/table toggle
  **Commit**: YES — `feat: migrate explore page`

---

- [ ] 22. Project Detail Page

  **What to do**: Migrate ProjectDetailPage + all detail components (Header, Info, Files, Interactions, Sidebar, Approval, Visibility, Export). Migrate CommentSection, RatingSection, BookmarkButton. Migrate projectRoutes.ts, projectHelpers.ts. Handle optional auth.

  **Recommended Agent Profile**: **Category**: `visual-engineering` | **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 5 (parallel) | **Blocked By**: Tasks 10, 11, 12, 17
  **References**: `web/src/features/projects/pages/ProjectDetailPage.tsx`, `web/src/features/projects/components/`, `web/src/components/CommentSection.tsx`, `web/src/components/RatingSection.tsx`, `web/src/features/bookmarks/`, `web/src/utils/projectRoutes.ts`
  **Acceptance Criteria**: `/pr/[slug]` renders all sections, guest access works, comments/ratings display
  **Commit**: YES — `feat: migrate project detail page`

---

- [ ] 23. Create/Edit Project Pages

  **What to do**: Migrate CreateProjectPage, EditProjectPage, ProjectBasicInfoForm, MemberManagementForm, DragDropFileUpload, useUnsavedChanges.

  **Recommended Agent Profile**: **Category**: `visual-engineering` | **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 5 (parallel) | **Blocked By**: Tasks 7, 10, 11, 17
  **References**: `web/src/features/projects/pages/CreateProjectPage.tsx`, `web/src/features/projects/pages/EditProjectPage.tsx`, `web/src/features/projects/components/`, `web/src/components/shared/DragDropFileUpload.tsx`
  **Acceptance Criteria**: Create form submits, edit loads existing data, file upload works
  **Commit**: YES — `feat: migrate create/edit project pages`

---

- [ ] 24. Profile/Settings Pages

  **What to do**: Migrate ProfilePage, SettingsPage. Include avatar upload, password change.

  **Recommended Agent Profile**: **Category**: `visual-engineering` | **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 5 (parallel) | **Blocked By**: Tasks 8, 17
  **References**: `web/src/pages/ProfilePage.tsx`, `web/src/pages/SettingsPage.tsx`, `web/src/features/auth/components/ChangePasswordForm.tsx`
  **Acceptance Criteria**: Profile editable, avatar upload works, password change works
  **Commit**: YES — `feat: migrate profile and settings pages`

---

### Wave 6: Feature Frontend Pages (ALL parallel)

- [ ] 25. Dashboard Pages (5 Role-Based)

  Migrate DashboardPage + StudentDashboard, FacultyDashboard, FacultyHomeDashboard, AdminDashboard, ReviewerDashboard, StatsCard, DashboardContainer. Also StudentMyProjectsPage.

  **Recommended Agent Profile**: **Category**: `visual-engineering` | **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 6 (parallel) | **Blocked By**: Tasks 8, 17
  **Acceptance Criteria**: Role-appropriate dashboard renders
  **Commit**: YES (groups with Wave 6)

---

- [ ] 26. Milestone Template Config Page

  Migrate MilestoneTemplateConfigPage + TemplateList, TemplateEditor, ProgramTemplateSelector.

  **Recommended Agent Profile**: **Category**: `visual-engineering` | **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 6 (parallel) | **Blocked By**: Tasks 14, 17
  **Acceptance Criteria**: Template CRUD works, admin-only
  **Commit**: YES (groups with Wave 6)

---

- [ ] 27. Notifications + Bookmarks Pages

  Migrate NotificationsPage, NotificationCenter, useNotifications. Migrate MyBookmarksPage, bookmarkCookies.ts.

  **Recommended Agent Profile**: **Category**: `visual-engineering` | **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 6 (parallel) | **Blocked By**: Tasks 13, 17
  **Acceptance Criteria**: Notifications list, mark read/delete. Bookmarks page shows projects.
  **Commit**: YES (groups with Wave 6)

---

- [ ] 28. Access Control Page (RBAC Admin)

  Migrate AccessControlPage + RolesTab, RoleCard, RoleDialog, PermissionsTab, PermissionSelector, UsersTab, AnalyticsTab. Also UserManagementPage.

  **Recommended Agent Profile**: **Category**: `visual-engineering` | **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 6 (parallel) | **Blocked By**: Tasks 8, 17
  **Acceptance Criteria**: Role/permission management works, admin-only
  **Commit**: YES (groups with Wave 6)

---

- [ ] 29. Repository Viewer Page

  Migrate RepositoryPage + FileBrowser, FileContentViewer, RepositoryLayout, RepositoryHeader, RepositoryTabs. Migrate repositoryStore.ts, repositoryApi.ts.

  **Recommended Agent Profile**: **Category**: `visual-engineering` | **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 6 (parallel) | **Blocked By**: Tasks 10, 11, 17
  **Acceptance Criteria**: File tree renders, file content viewer works, breadcrumbs work
  **Commit**: YES (groups with Wave 6)

---

- [ ] 30. Project Follow Page

  Migrate ProjectFollowPage + ActivityFeed, MilestoneTimeline, ProjectFlags, ProjectFollowers, ProjectHealthScore, and all sub-components.

  **Recommended Agent Profile**: **Category**: `visual-engineering` | **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 6 (parallel) | **Blocked By**: Tasks 14, 15, 17
  **Acceptance Criteria**: Activity feed, milestone timeline, flags, followers all render
  **Commit**: YES — `feat: migrate all feature pages`

---

### Wave 7: Advanced Features + Cleanup

- [ ] 31. AI Analysis Service

  **What to do**: Port `AiAnalysisService.php` → `src/lib/ai-analysis.ts`. Support Gemini, OpenAI, Claude + fallback keyword extraction. Run inline (no queue). Store results in ProjectAiMetadata via Prisma.

  **Must NOT do**: No embeddings/similarity search. No queue system. No AI Search Controller endpoints.

  **Recommended Agent Profile**: **Category**: `unspecified-high` | **Skills**: []
  **Parallelization**: Wave 7 (parallel) | **Blocked By**: Task 2
  **References**: `api/app/Services/AiAnalysisService.php`, `api/app/Jobs/AnalyzeProjectWithAi.php`, `api/app/Models/ProjectAiMetadata.php`
  **Acceptance Criteria**: Fallback keyword extraction works without API keys, analysis stores metadata
  **Commit**: YES — `feat: port AI analysis service`

---

- [ ] 32. TODO Stub Pages

  Create empty "Coming Soon" stubs: `app/evaluations/page.tsx`, `app/approvals/page.tsx`, `app/admin/approvals/page.tsx`, `app/faculty/pending-approvals/page.tsx`. Create 501 API stubs.

  **Recommended Agent Profile**: **Category**: `quick` | **Skills**: []
  **Parallelization**: Wave 7 (parallel) | **Blocked By**: Task 17
  **Acceptance Criteria**: Pages render "Coming Soon", API stubs return 501
  **Commit**: YES — `chore: add TODO stub pages`

---

- [ ] 33. Shared Components Finalization

  **What to do**: Migrate remaining: CommandPalette, ErrorBoundary, StatusSelector, ConfirmDialog, Breadcrumb, SkipLink, UniversalSearchBox. Migrate hooks: useResponsive, useKeyboardNavigation, useSwipeGesture. Migrate types, themeStore. Migrate `web/src/lib/api.ts` → `src/lib/api.ts` (change base URL to same-origin, keep Axios interceptors). Replace all `import.meta.env`.

  **Recommended Agent Profile**: **Category**: `unspecified-low` | **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 7 (parallel) | **Blocked By**: Task 17
  **Acceptance Criteria**: Build passes, Command palette opens with Cmd+K, API service uses same-origin
  **Commit**: YES — `feat: migrate shared components, hooks, types, API service`

---

- [ ] 34. Static Pages

  Migrate TermsOfServicePage, PrivacyPolicyPage, AnalyticsPage.

  **Recommended Agent Profile**: **Category**: `quick` | **Skills**: []
  **Parallelization**: Wave 7 (parallel) | **Blocked By**: Task 17
  **Acceptance Criteria**: `/terms`, `/privacy`, `/analytics` render
  **Commit**: YES — `feat: migrate static pages`

---

### Wave 8: Deployment & Polish

- [ ] 35. Database Seeding

  **What to do**: Create `prisma/seed.ts`: 4 roles, all permissions with scopes, 6+ departments, 7+ programs, default milestone template (10 items), test users (1 admin, 3 faculty, 4 students, 1 reviewer), sample projects. Add to package.json: `"prisma": { "seed": "tsx prisma/seed.ts" }`.

  **Recommended Agent Profile**: **Category**: `unspecified-high` | **Skills**: []
  **Parallelization**: Wave 8 (sequential before 36) | **Blocked By**: Task 2
  **References**: `api/database/seeders/` — All seeder files (RoleSeeder, PermissionSeeder, UserSeeder, DepartmentSeeder, ProgramSeeder, ProjectSeeder)
  **Acceptance Criteria**: `npx prisma db seed` exits 0, admin can login, sample projects exist
  **Commit**: YES — `feat: create database seed`

---

- [ ] 36. CranL Deployment Configuration

  **What to do**:
  - Create `Dockerfile` (multi-stage: deps → build → runner):
    ```dockerfile
    FROM node:20-alpine AS base
    FROM base AS deps
    WORKDIR /app
    COPY package.json package-lock.json ./
    RUN npm ci
    FROM base AS builder
    WORKDIR /app
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    RUN npx prisma generate
    RUN npm run build
    FROM base AS runner
    WORKDIR /app
    ENV NODE_ENV=production
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/prisma ./prisma
    EXPOSE 3000
    CMD ["node", "server.js"]
    ```
  - Ensure `next.config.ts` has `output: 'standalone'`
  - Create `.dockerignore`: node_modules, .next, api/, web/
  - Create `.env.example` with all production variables

  **Must NOT do**: No Vercel-specific configs. No hardcoded env vars.

  **Recommended Agent Profile**: **Category**: `quick` | **Skills**: []
  **Parallelization**: Sequential after 35 | **Blocked By**: Task 35
  **Acceptance Criteria**: `docker build -t fahras .` succeeds, container responds on 3000
  **Commit**: YES — `feat: add CranL deployment config`

---

- [ ] 37. Final QA Verification

  **What to do**: Full build verification, seed DB, test all API routes via curl, test auth flow, test project CRUD, screenshot key pages.

  **Recommended Agent Profile**: **Category**: `deep` | **Skills**: [`playwright`]
  **Parallelization**: FINAL task | **Blocked By**: ALL

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Full build with Turbopack (Next.js 16 default)
    Tool: Bash
    Steps:
      1. npm run build → Assert exit 0
      2. npx tsc --noEmit → Assert exit 0
      3. npx eslint . → Assert exit 0 (ESLint CLI, NOT next lint)

  Scenario: Proxy file is correct (Next.js 16)
    Tool: Bash
    Steps:
      1. test -f proxy.ts → Assert exists
      2. test ! -f middleware.ts → Assert does NOT exist
      3. grep "export function proxy" proxy.ts → Assert found

  Scenario: Auth flow end-to-end
    Tool: Playwright
    Steps:
      1. Navigate to /login
      2. Fill email/password, submit
      3. Wait for /dashboard
      4. Assert dashboard renders
      5. Screenshot: .sisyphus/evidence/task-37-auth.png

  Scenario: All public API routes respond
    Tool: Bash (curl)
    Steps:
      1. GET /api/programs → Assert 200
      2. GET /api/departments → Assert 200
      3. GET /api/projects → Assert 200
      4. GET /api/tags → Assert 200
      5. GET /api/roles → Assert 200
  ```

  **Commit**: YES — `chore: final QA — all routes, APIs, flows verified`

---

## Commit Strategy

| After Task(s) | Message | Verification |
|---------------|---------|--------------|
| 1 | `feat: initialize Next.js 16 project with Turbopack` | `npm run build` |
| 2 | `feat: define Prisma schema with 31 models` | `npx prisma generate` |
| 3 | `feat: setup MUI v7 theme, providers, i18n, RTL` | `npx tsc --noEmit` |
| 4 | `feat: setup NextAuth v5 with JWT` | `npx tsc --noEmit` |
| 5 | `feat: implement auth API routes` | `npx tsc --noEmit` |
| 6 | `feat: implement RBAC middleware` | `npx tsc --noEmit` |
| 7-16 | `feat: implement all API routes` | `npx tsc --noEmit` |
| 17 | `feat: migrate layout components` | `npm run build` |
| 18 | `feat: migrate auth pages` | `npm run build` |
| 19 | `feat: implement Next.js 16 proxy` | `npm run build` |
| 20-24 | `feat: migrate core pages` | `npm run build` |
| 25-30 | `feat: migrate feature pages` | `npm run build` |
| 31 | `feat: port AI analysis service` | `npx tsc --noEmit` |
| 32 | `chore: add TODO stubs` | `npm run build` |
| 33 | `feat: migrate shared components` | `npm run build` |
| 34 | `feat: migrate static pages` | `npm run build` |
| 35 | `feat: create database seed` | `npx prisma db seed` |
| 36 | `feat: add CranL deployment config` | `docker build .` |
| 37 | `chore: final QA verification` | Full suite |

---

## Success Criteria

### Verification Commands
```bash
npm run build                    # Turbopack default (Next.js 16) — exit 0
npx tsc --noEmit                 # Zero type errors — exit 0
npx eslint . --max-warnings 0   # ESLint CLI (NOT next lint) — exit 0
npx prisma generate              # Schema compiles — exit 0
npx prisma db seed               # Seed data created — exit 0
docker build -t fahras .         # Docker image builds — success
test -f proxy.ts                 # Next.js 16 proxy file exists
test ! -f middleware.ts          # No middleware.ts (Next.js 15 convention)
```

### Final Checklist
- [ ] All 33 page routes render without errors
- [ ] All 92 API endpoints return expected responses
- [ ] Auth flow: register → login → protected route → logout
- [ ] Project flow: create → edit → search → detail → delete
- [ ] File flow: upload → download → delete
- [ ] RBAC: admin routes blocked for non-admins
- [ ] Guest access: public project viewable without auth
- [ ] Arabic/RTL: layout switches correctly
- [ ] MUI theme: colors, typography match original
- [ ] `proxy.ts` handles route protection (NOT middleware.ts)
- [ ] Turbopack is default bundler (no --turbopack flag)
- [ ] `next.config.ts` uses `cacheComponents` and `turbopack` at top level
- [ ] ESLint runs via CLI (NOT `next lint`)
- [ ] Docker image builds and runs on CranL
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
