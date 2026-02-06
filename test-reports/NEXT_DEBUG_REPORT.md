# Next.js Debug Report — Fahras (Comprehensive)

**Generated:** 2026-02-04  
**Method:** Next.js DevTools MCP (init), production build (`next build`), ESLint, TypeScript (`tsc --noEmit`), codebase scan (API routes, layouts, Cache Components)  
**Next.js:** 16.1.6 (Turbopack, Cache Components)  
**Project path:** `/home/omd/Documents/CTI/Fahras`

---

## Executive Summary

The app **fails production build** due to:

1. **API prerender bailouts** — `/api/projects/suggestions` uses `request.url`; `/api/user` uses `auth()` → `headers()` during static generation.
2. **Blocking routes (Cache Components)** — `/pr/[slug]/edit` (and likely `/pr/[slug]/code` and other dynamic pages) trigger “Uncached data was accessed outside of &lt;Suspense&gt;” because the shared **Header** uses `useRouter()`/`usePathname()` and pages use `useState`/`useRouter` without Suspense boundaries.

**Runtime** fails when `DATABASE_URL` is missing (Prisma). **No** `export const dynamic` (or `runtime`) exists anywhere in `src/`, so many API routes that use request-bound APIs are at risk under Next.js 16 prerender. **TypeScript** and **ESLint** pass. **Static assets:** no `public/` directory; favicon and `organization-config.yml` will 404 if expected at root.

Fixing the build (API + route segment config or Suspense), setting `DATABASE_URL`, and optionally adding `public/` and `dynamic = 'force-dynamic'` for request-bound API routes is required for deployment and a clean runtime.

---

## 1. Production Build Failures (Critical)

### 1.1 `/api/projects/suggestions` — Prerender bailout (`request.url`)

**Error:**  
`Route /api/projects/suggestions needs to bail out of prerendering at this point because it used request.url.`

**Location:** `src/app/api/projects/suggestions/route.ts:6`

**Cause:**  
`GET` uses `const url = new URL(request.url)` to read query params. Next.js 16 can prerender route handlers; `request.url` is request-bound and not available at prerender time.

**Fix (choose one):**

- **Option A — Opt out of static prerender (recommended):**  
  At the top of the route file (after imports):
  ```ts
  export const dynamic = 'force-dynamic';
  ```
- **Option B:**  
  Use `request.nextUrl.searchParams.get('q')` instead of `new URL(request.url)` if your Next version does not prerender on that; otherwise use Option A.

---

### 1.2 `/api/user` — Prerender rejection (`headers()`)

**Error:**  
`During prerendering, headers() rejects when the prerender is complete. ... This occurred at route "/api/user".`  
Stack: `auth()` in `src/lib/auth-helpers.ts:18` → `src/app/api/user/route.ts:7` (`requireAuth()`).

**Cause:**  
`requireAuth()` calls `auth()`, which uses NextAuth’s `headers()`. Prerender runs without a real request, so `headers()` is invalid.

**Fix:**  
In `src/app/api/user/route.ts`, add:

```ts
export const dynamic = 'force-dynamic';
```

---

### 1.3 `/pr/[slug]/edit` — Uncached data outside `<Suspense>` (blocking route)

**Error:**  
`Route "/pr/[slug]/edit": Uncached data was accessed outside of <Suspense>. This delays the entire page from rendering, resulting in a slow user experience.`  
Stack references: `src/components/layout/Header.tsx:66` (`useRouter()`), `src/app/pr/[slug]/edit/page.tsx:36` (`useState`).

**Cause:**  
With **Cache Components** enabled (`next.config.ts`: `cacheComponents: true`), Next.js treats client hooks and request-bound data as “uncached.” The root layout uses **AppLayout** → **Header**, which uses `useRouter()` and `usePathname()`. The edit page uses `useState` and `useRouter`/`useParams` without a Suspense boundary, so the whole route is treated as blocking.

**Same pattern (at risk):**  
- `/pr/[slug]/code` — `useState`, `useRouter`, `useParams` in page; Header in layout.  
- `/pr/[slug]/follow` — heavy `useState` and `useRouter`.  
- `/pr/[slug]` (detail), `/pr/create` — `useState` and `useRouter`.  
- Any page under a layout that includes **Header** (which uses `useRouter`/`usePathname`) will be affected if the page uses uncached data without Suspense.

**Fix (choose one):**

- **Option A — Segment dynamic (simplest):**  
  Add `src/app/pr/[slug]/layout.tsx` (or per-route layout where applicable) with:
  ```ts
  export const dynamic = 'force-dynamic';
  ```
  So the entire `/pr/[slug]/*` segment is dynamic and not statically prerendered.  
  For `/pr/create`, add `src/app/pr/create/layout.tsx` with the same export if that route also fails.

- **Option B — Wrap in Suspense:**  
  In the layout that wraps these pages (or in each page), wrap the content that uses `useRouter`/`usePathname`/`useState` in `<Suspense fallback={...}>` so the rest of the page can stream. This may require splitting **Header** or the page into a component that is wrapped by Suspense.

- **Option C — Disable Cache Components:**  
  In `next.config.ts`, set `cacheComponents: false`. This avoids the “uncached data outside Suspense” rule but loses Cache Components benefits.

---

## 2. API Routes and Request-Bound APIs

**Finding:** No `export const dynamic` or `export const runtime` exists in `src/`. Any route that uses request-bound APIs during static analysis can hit prerender issues.

| Route | Issue | Recommendation |
|-------|--------|----------------|
| `src/app/api/projects/suggestions/route.ts` | Uses `request.url` | Add `export const dynamic = 'force-dynamic'` (or use `request.nextUrl.searchParams`) |
| `src/app/api/user/route.ts` | Uses `requireAuth()` → `auth()` → `headers()` | Add `export const dynamic = 'force-dynamic'` |
| `src/app/api/search-queries/route.ts` | Uses `optionalAuth()` → `auth()`, `request.headers` | Add `export const dynamic = 'force-dynamic'` for consistency |

**Project-wide:** Any API route that uses `request.url`, `request.headers`, `headers()`, `cookies()`, or `auth()`/`requireAuth()`/`optionalAuth()` should opt out of prerender with `dynamic = 'force-dynamic'` where appropriate to keep builds and Cache Components behavior predictable.

---

## 3. Runtime / Environment

### 3.1 Missing `DATABASE_URL` (Prisma)

**Error:**  
`Environment variable not found: DATABASE_URL` (from `prisma/schema.prisma`).  
`PrismaClientInitializationError` when any code calls Prisma (e.g. `prisma.project.findMany()`).

**Impact:**  
Any route or page that uses Prisma (e.g. project list, suggestions, user, notifications) can return 500 and log this error. Observed in “Error fetching projects” and “Failed to fetch recent projects” on the home page.

**Fix:**  
Set `DATABASE_URL` where the app runs (e.g. `.env`):

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Restart the dev server after changing env.

### 3.2 API Routes Using Prisma (depend on DATABASE_URL)

Many API routes use `prisma` and will fail at runtime if `DATABASE_URL` is not set. Examples (non-exhaustive):  
`api/projects/route.ts`, `api/projects/suggestions/route.ts`, `api/user/route.ts`, `api/search-queries/route.ts`, `api/tags/route.ts`, `api/saved-searches/route.ts`, `api/roles/route.ts`, `api/register/route.ts`, `api/notifications/*`, `api/milestones/*`, `api/milestone-templates/*`, `api/files/*`, `api/departments/route.ts`, `api/faculties/route.ts`, `api/bookmarks/*`, `api/admin/users/*`, and project slug routes under `api/projects/[slug]/*`.  
Ensure `DATABASE_URL` (and any other required env from `.env.example`) is set for both dev and production.

---

## 4. Static Assets and Public Files

### 4.1 Missing `public/` directory

**Finding:** The project has **no** `public/` directory (no `public` folder found under the project root).

**Impact:**  
- Next.js serves static files from `public/`. Without it, there is no built-in place for favicon or root-level YAML.
- **Favicon:** If the app or `organization` config expects a favicon at `/favicon.ico` or `/assets/logos/fahras-favicon.ico`, those requests will 404 unless served by something else (e.g. middleware or external host).
- **organization-config.yml:** `src/config/organization.ts` fetches `/organization-config.yml` in non-production. Without `public/organization-config.yml`, that fetch will 404 (code falls back to default config, but console may show 404).

**Fix:**  
- Create `public/` and add `favicon.ico` (and optionally `public/organization-config.yml`, `public/assets/logos/fahras-favicon.ico`) if the app is intended to serve them.
- Or document that favicon and organization config are provided by an external host/CDN.

---

## 5. Static Analysis (TypeScript & ESLint)

- **TypeScript (`npx tsc --noEmit`):** No errors.
- **ESLint (`npm run lint`):** No errors.

No issues reported from these tools.

---

## 6. Routes Overview

All routes are under the **App Router**. Summary:

- **Pages:** `/`, `/access-control`, `/admin/approvals`, `/analytics`, `/approvals`, `/bookmarks`, `/dashboard`, `/evaluations`, `/explore`, `/faculty/pending-approvals`, `/forgot-password`, `/login`, `/milestone-templates`, `/notifications`, `/pr/[slug]`, `/pr/[slug]/code`, `/pr/[slug]/edit`, `/pr/[slug]/follow`, `/pr/create`, `/privacy`, `/profile`, `/register`, `/reset-password`, `/settings`, `/student/my-projects`, `/terms`, `/verify-email`.
- **API:** Multiple `/api/*` routes (auth, projects, user, notifications, files, milestones, roles, admin, etc.).

No duplicate or obviously broken route patterns were observed. The build fails at **static generation** for the routes and API handlers listed above, not because of invalid route definitions.

---

## 7. Browser / Runtime Console (from prior runs)

When the server runs and the home page is loaded:

- **404** — `/favicon.ico`, `/organization-config.yml` (expected if `public/` is missing or files not added).
- **500** — `/api/projects?per_page=6&...` (Internal Server Error when Prisma/DATABASE_URL is missing).
- **Failed to fetch recent projects** — due to the 500 from `/api/projects`.
- **401** — `/api/notifications` (expected when not logged in).

Fixing `DATABASE_URL` and adding a favicon (and optional `organization-config.yml`) in `public/` will reduce console noise and restore project loading on the home page.

---

## 8. Recommendations (Priority Order)

1. **Fix production build (required for deploy)**  
   - Add `export const dynamic = 'force-dynamic'` to:
     - `src/app/api/projects/suggestions/route.ts`
     - `src/app/api/user/route.ts`
   - Resolve blocking route for `/pr/[slug]/edit` (and similarly affected routes):
     - **Preferred:** Add `src/app/pr/[slug]/layout.tsx` with `export const dynamic = 'force-dynamic'` (and optionally `src/app/pr/create/layout.tsx` if create fails).
     - **Alternative:** Wrap dynamic UI (Header and/or page content) in `<Suspense>` so the route is not blocking; or set `cacheComponents: false` in `next.config.ts` if you do not need Cache Components.

2. **Environment**  
   - Set `DATABASE_URL` (and any other required vars from `.env.example`) for both dev and production so Prisma and all DB-dependent routes work.

3. **API consistency**  
   - Add `dynamic = 'force-dynamic'` to any other API route that uses `headers()`, `cookies()`, `auth()`, or `request.url`/`request.headers` (e.g. `src/app/api/search-queries/route.ts`) so future builds remain predictable.

4. **Static assets**  
   - Create `public/` and add `favicon.ico` (and optionally `organization-config.yml` and `/assets/logos/fahras-favicon.ico`) if the app should serve them from the same origin.

5. **Re-run checks after changes**  
   - `npm run build`  
   - Open key pages (e.g. `/`, `/pr/[slug]/edit`, `/pr/[slug]/code`) in the browser and confirm no runtime errors in dev tools or in `.next/dev/logs/next-development.log`.

---

## 9. Tools and Data Used

- **Next.js DevTools MCP:** `init` (project path: `/home/omd/Documents/CTI/Fahras`).
- **Build:** `next build` (failed; errors captured and summarized above).
- **Lint:** `npm run lint` (passed).
- **TypeScript:** `npx tsc --noEmit` (passed).
- **Codebase:** Grep and file reads for `request.url`, `headers()`, `cookies()`, `auth()`, `requireAuth`, `optionalAuth`, `useRouter`, `usePathname`, `useState`, `export const dynamic`, `export const runtime`, and for `public/` and Prisma usage across `src/app/api` and `src/app/pr`.

---

*End of report.*
