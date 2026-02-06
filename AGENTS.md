# FAHRAS — PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-05
**Commit:** b456d79
**Branch:** main

## OVERVIEW

Graduation project archiving system for TVTC (Saudi Arabia). **Next.js 16 full-stack monorepo** with Prisma ORM, NextAuth v5, PostgreSQL, MUI v7, and S3/MinIO storage. Bilingual EN/AR with RTL support.

> **WARNING: `CLAUDE.md` is OUTDATED.** It describes the old Laravel 11 + React 19 architecture. The project was migrated to Next.js 16. Prisma replaced Eloquent, NextAuth replaced Sanctum, App Router replaced React Router. The `api/` and `web/` directories referenced in CLAUDE.md no longer contain active code — they were removed in commit "chore: remove old Laravel API and React frontend (dead code)".

## STRUCTURE

```
./
├── src/                    # ALL application code — SEE src/AGENTS.md
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API routes (52 handlers) — SEE src/app/api/AGENTS.md
│   │   ├── pr/[slug]/     # Project detail routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── explore/       # Project discovery
│   │   ├── login/         # Auth pages
│   │   └── ...            # 20+ page routes
│   ├── features/          # Feature modules (auth, projects, dashboards, milestones, notifications, bookmarks)
│   ├── components/        # Shared UI (layout/, explore/, shared/)
│   ├── lib/               # Core services (api.ts, auth.ts, prisma.ts, s3.ts)
│   ├── middleware/         # Auth + RBAC wrappers
│   ├── hooks/             # Custom React hooks
│   ├── providers/         # React context providers (Theme, Language, Emotion)
│   ├── constants/         # Permission codes, status enums
│   ├── config/            # Organization config, dashboard themes
│   ├── styles/            # MUI theme, design tokens, accessibility CSS
│   ├── store/             # Zustand stores (theme only at root)
│   ├── types/             # TypeScript interfaces
│   └── i18n/              # Translation definitions
├── prisma/                # schema.prisma + seed.ts
├── scripts/               # Setup, deployment, Docker, backend utilities
├── .docker/               # Dockerfiles, nginx configs
├── .github/workflows/     # CI/CD pipeline
└── organization-config.yml  # Branding source of truth (TVTC, colors, URLs)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add API endpoint | `src/app/api/{resource}/route.ts` | Use `withAuth`/`withRole` middleware |
| Add page | `src/app/{path}/page.tsx` | All pages are `'use client'` currently |
| Add feature | `src/features/{name}/` | Mirror existing: `components/`, `hooks/`, `store.ts` |
| Add shared component | `src/components/shared/` | Or `layout/` / `explore/` by domain |
| Add custom hook | `src/hooks/` | Export via `src/hooks/index.ts` barrel |
| Modify auth flow | `src/lib/auth.ts` | NextAuth v5 Credentials provider |
| Modify DB schema | `prisma/schema.prisma` | Then `npx prisma generate` |
| Change branding | `organization-config.yml` + `src/config/organization.ts` | YAML = source of truth |
| Docker setup | `docker-compose.dev.yml` | Zero-config dev; `docker-compose.yml` = production |
| Deployment | `scripts/deployment/deploy.sh` or `.github/workflows/ci-cd.yml` | |

## CONVENTIONS

**Path aliases** — Always use `@/` imports (configured in tsconfig):
```
@/lib/*, @/features/*, @/components/*, @/utils/*, @/hooks/*, @/types/*, @/config/*, @/providers/*, @/styles/*, @/store/*, @/constants/*
```

**MUI v7 Grid** — Use `size` prop, not `item`:
```tsx
<Grid size={{ xs: 12, md: 6 }}>  // Correct
<Grid item xs={12} md={6}>       // WRONG (v4 syntax)
```

**Safe data access** — Always fallback:
```tsx
{(items || []).map(item => ...)}
const name = user?.full_name || 'Unknown';
```

**API response handling** — Defensive:
```tsx
const data = response.data || response || [];
```

**Project URLs** — Always slug-based via `src/utils/projectRoutes.ts`:
```tsx
projectRoutes.detail(project.slug)  // '/pr/244k3n'
```

**State management** — Zustand with persist middleware. Auth store lives in `src/features/auth/store.ts`, theme in `src/store/themeStore.ts`.

**Provider chain** — `LanguageProvider → EmotionCacheProvider → MuiThemeProvider → ThemeProvider`

## ANTI-PATTERNS (THIS PROJECT)

- **NEVER trust CLAUDE.md for architecture** — It describes dead Laravel code
- **NEVER use `as any`, `@ts-ignore`, `@ts-expect-error`** — Project uses strict TS
- **NEVER hardcode project URLs** — Use `projectRoutes` utility
- **NEVER use MUI Grid `item` prop** — Use `size` prop (v7)
- **NEVER reference `api/` or `web/` directories** — They were removed
- **NEVER use relative imports** when path alias exists
- **NEVER skip fallback arrays** — API responses can be null/undefined

## UNIQUE STYLES

- **Bilingual (EN/AR)** with RTL support — `LanguageProvider` handles direction
- **TVTC branding** — Organization config in YAML, loaded at runtime in dev
- **`'use client'` on all pages** — No Server Components in use currently
- **Prisma reads Laravel-era DB** — Schema maps to snake_case PostgreSQL tables but uses camelCase TS fields
- **bcrypt compatibility** — NextAuth handles Laravel's `$2y$` bcrypt prefix transparently
- **RFC 5987 filenames** — `rfc5987ContentDisposition()` in s3.ts for Arabic filename downloads
- **Large files are common** — 9 files >500 lines; follow/page.tsx is 2057 lines. Decomposition is a known debt.

## COMMANDS

```bash
# Development
npm run dev                          # Next.js dev server (Turbopack)
npm run build                        # Production build
npm run lint                         # ESLint (flat config)
npx prisma generate                  # Regenerate Prisma client after schema changes
npx prisma db push                   # Push schema to DB (dev only)

# Docker
docker compose -f docker-compose.dev.yml up -d   # Dev environment (zero-config)
docker compose up -d                              # Production environment
docker compose down -v                            # Reset everything

# Database (via Docker — Laravel still owns migrations)
docker compose exec php php artisan migrate:fresh --seed   # Full reset
docker compose exec php php artisan migrate                # Pending only
```

## NOTES

- **Hybrid architecture**: Next.js handles frontend + API, but PostgreSQL schema was created by Laravel migrations. Docker Compose still runs Laravel (PHP-FPM) for migration management.
- **NextAuth v5 is beta** (`5.0.0-beta.30`) — API may change.
- **Auth token dual storage**: NextAuth JWT in HTTP-only cookie + manual token in `localStorage` (`auth-storage` key) for API calls via `src/lib/api.ts`.
- **Docker Compose variants**: `dev.yml` (zero-config), `forgejo.yml` (self-hosted Git), `nixpacks.yml`/`railpack.yml` (PaaS deploy).
- **Permissions format**: `{code}:{scope}` strings (e.g., `projects.view:all`). Parsed by `src/middleware/rbac.ts`.
- **CI/CD**: GitHub Actions 4-job pipeline (test-backend, test-frontend, security-scan, deploy). Forgejo + Act Runner as alternative.
- **`app/` vs `src/app/`**: API routes live in `src/app/api/`. Page routes live in `src/app/`. Both are valid Next.js App Router directories.
