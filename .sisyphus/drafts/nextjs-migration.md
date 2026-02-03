# Draft: Fahras → Next.js Migration

## Original Request
"REFACTOR CODE TO NEXT JS NO BACKEND FRONTEND ONLY ONE APP"

## Requirements (confirmed)
- ✅ Migration target: Next.js (Full-Stack)
- ✅ Eliminate Laravel entirely — Next.js handles EVERYTHING
- ✅ "Nothing but Next" — pure Next.js stack, single codebase, single deployment
- ✅ API routes replace Laravel controllers
- ✅ Next.js ORM replaces Eloquent
- ✅ NextAuth/similar replaces Sanctum

## Current Architecture
- **Backend**: Laravel 11 API (PHP) — PostgreSQL, Redis, MinIO, Sanctum auth, RBAC
- **Frontend**: React 19 + TypeScript + Vite — MUI v7, Zustand, React Router v7, Axios
- **Infrastructure**: Docker Compose (php, node, db, redis, minio)

## Frontend Inventory
- 122 TypeScript/TSX files (~45K LOC)
- 8 feature modules: auth, projects, project-follow, repository, bookmarks, dashboards, notifications, milestones, access-control
- 15 legacy pages
- 45 shared components
- 30+ routes (React Router v7)
- 100+ API endpoints in api.ts
- 3 Zustand stores (auth, repository, theme)
- RTL/Arabic support
- i18n (translations.ts)
- WCAG AA accessibility

## Technical Decisions
- ✅ Architecture: Full-stack Next.js (API routes + App Router)
- ✅ App Router (modern, RSC-first)
- ✅ Database: Managed PostgreSQL in cloud (Neon/Supabase/Vercel Postgres)
- ✅ Cache: Managed Redis (Upstash — native Vercel integration)
- ✅ UI: Keep MUI v7 (client components with 'use client')
- ✅ Feature scope: Migrate EVERYTHING — full parity
- ✅ Deployment: Vercel
- ✅ NO PHP/Laravel — pure Next.js/TypeScript stack
- (pending) ORM: Prisma vs Drizzle
- (pending) Auth: NextAuth.js v5 (Auth.js) vs Clerk
- (pending) File storage: Vercel Blob vs Cloudflare R2 vs S3
- (pending) Queue for AI jobs: Inngest vs Trigger.dev vs QStash
- (pending) Email service: Resend vs SendGrid

## Backend Inventory (to replicate)
- 12 controllers → ~15-20 API route handlers
- 25 models → Prisma/Drizzle schema
- 30+ database tables
- 50+ API endpoints
- 5 services (business logic)
- 1 async job (AI analysis)
- Custom RBAC system (4 roles, granular permissions with scopes)
- File storage (S3/MinIO multi-provider)
- AI analysis (Gemini/OpenAI/Claude with fallback)
- Email verification with magic links
- Full-text search (PostgreSQL)
- Activity logging (audit trail)

## Open Questions
1. CRITICAL: Does "no backend" mean eliminate Laravel entirely and move DB/auth/storage logic to Next.js API routes?
2. CRITICAL: Or does "no backend" mean keep the API but merge into one Next.js codebase?
3. What's the deployment target? (Vercel, Docker, VPS?)
4. Should we keep the current database (PostgreSQL) and storage (MinIO)?
5. Any features to drop or add during migration?
6. Timeline/urgency?

## Scope Boundaries
- INCLUDE: (pending)
- EXCLUDE: (pending)
