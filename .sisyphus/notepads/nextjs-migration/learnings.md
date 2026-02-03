# Learnings — Next.js 16 Migration

This file accumulates conventions, patterns, and wisdom discovered during the migration.

---

## Task 1: Project Initialization (2026-02-03)

### Next.js 16.1.6 Config Facts
- `cacheComponents: true` is TOP-LEVEL in next.config.ts (not experimental). Confirmed via type defs.
- `turbopack: {}` is TOP-LEVEL. Empty object enables it. Accepts `resolveAlias`, `resolveExtensions`, `rules`.
- `experimental.cacheComponents` and `experimental.dynamicIO` are DEPRECATED in 16.x — use top-level `cacheComponents`.
- Build output confirms: `▲ Next.js 16.1.6 (Turbopack, Cache Components)` — both active by default.
- No `--turbopack` flag needed in dev/build scripts. Turbopack is the default bundler in 16.x.

### ESLint in Next.js 16
- Uses flat config format: `eslint.config.mjs` with `defineConfig` and `globalIgnores` from `"eslint/config"`.
- Must import `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` separately.
- Add `api/**` and `web/**` to globalIgnores to avoid linting the legacy codebase.
- Use `npx eslint .` directly, NOT `next lint`.

### Prisma Integration
- Existing `prisma/schema.prisma` at root already present from prior scaffolding.
- `prisma generate` runs successfully in postinstall (with `|| true` fallback for schema validation errors).
- `@types/bcryptjs` is deprecated — bcryptjs 3.x ships its own types.
- Prisma singleton at `src/lib/prisma.ts` uses `globalThis` pattern for dev HMR stability.

### tsconfig.json
- Next.js 16 generates `"plugins": [{ "name": "next" }]` — keep this for IDE integration.
- Path aliases: `@/*` maps to `./src/*`. All sub-aliases (`@/components/*`, etc.) also added for explicit resolution.
- Must exclude `api` and `web` directories to avoid TypeScript picking up legacy code.
- `include` must have `next-env.d.ts`, `.next/types/**/*.ts`, `.next/dev/types/**/*.ts`, and `**/*.mts`.

### Dependencies Installed
- Core: next 16.1.6, react 19.x, react-dom 19.x
- UI: @mui/material 7.x, @emotion/react, @emotion/styled, framer-motion
- State: zustand 5.x
- Data: @prisma/client, axios
- Auth: next-auth 5.0.0-beta.30
- Storage: @aws-sdk/client-s3
- Utils: bcryptjs, crypto-js, cmdk, js-yaml, react-window, stylis, stylis-plugin-rtl
- NOT installed (by design): react-router-dom (Next.js routing), tailwind, vitest/jest, next-intl

### Project Structure
- Source lives in `src/` directory (--src-dir flag)
- App Router pages in `src/app/`
- Shared lib in `src/lib/`
- Pre-created empty dirs: components, features, utils, store, types, config, providers, styles, i18n
- No `middleware.ts` — Next.js 16 uses `proxy.ts` for route protection (Task 19)


## Session 1 Summary (2026-02-03)

**Completed**: 6/62 tasks (9.7%)
**Token Usage**: 116k/200k (58%)
**Time**: ~3 hours

### What Works
- Next.js 16 foundation solid (Turbopack, cacheComponents, proxy architecture)
- Prisma schema complete (32 models, 16 enums)
- MUI v7 theme fully migrated with RTL
- NextAuth v5 configured with JWT
- 8 API routes functional (register, login, user, programs, departments, tags, faculties, nextauth)

### Critical Blockers
- Subagent delegation highly unreliable (4+ failed sessions)
- RBAC middleware (Task 6) not implemented
- 11/14 auth routes incomplete
- All UI pages not started (Tasks 17-30)

### Strategic Decision
Full 62-task migration requires estimated 1000k+ tokens. Current session establishes foundation for incremental completion. Next session should focus on:
1. Critical path: Project CRUD (Task 10)
2. proxy.ts (Task 19)  
3. Core UI pages (Tasks 20-23)

