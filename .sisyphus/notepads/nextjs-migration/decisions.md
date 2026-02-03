# Decisions — Next.js 16 Migration

This file records architectural choices and technical decisions.

---

## Prisma Schema Decisions (Task 2)

### Schema Location & Purpose
- Created `prisma/schema.prisma` as the single source of truth for database structure
- Schema mirrors ALL 32 tables from Laravel backend (22 migration files consolidated)
- Schema is READ-ONLY for Prisma Client generation — Laravel owns the migration lifecycle

### Naming Conventions
- **Models**: PascalCase (e.g., `ProjectMember`) with `@@map("table_name")` for DB tables
- **Fields**: camelCase (e.g., `createdByUserId`) with `@map("snake_case")` for DB columns
- **Enums**: PascalCase names (e.g., `AdminApprovalStatus`) with exact DB values as entries
- All 32 models have `@@map`, ~222 fields have `@map` where camelCase differs from snake_case

### Type Mapping Decisions
- Laravel `string()` → Prisma `String` (varchar 255 default)
- Laravel `string('col', N)` → Prisma `String @db.VarChar(N)` for specific lengths (e.g., slug=20, code=6, token=64)
- Laravel `text()/longText()` → Prisma `String @db.Text` (PostgreSQL treats both as `text`)
- Laravel `json/jsonb` → Prisma `Json` (14 JSON fields total)
- Laravel `bigInteger` → Prisma `BigInt` (only `size_bytes` in files table)
- Laravel `float` → Prisma `Float` (only `confidence_score` in project_tag)
- Laravel `date` → Prisma `DateTime @db.Date` (only `due_date` in project_milestones)
- Laravel `morphs('tokenable')` → Plain `tokenableType`/`tokenableId` fields (Prisma lacks polymorphic relations)

### Relationship Decisions
- **Explicit join tables**: `RoleUser`, `PermissionRole`, `ProjectTag`, `ProjectMember`, `ProjectAdvisor` modeled as explicit Prisma models (not implicit many-to-many) because they carry extra columns (timestamps, scope, source, role)
- **Named relations**: Used for models with multiple FKs to the same table:
  - User ← Project: `"ProjectCreator"` / `"ProjectApprover"`
  - User ← ProjectFlag: `"FlagCreator"` / `"FlagResolver"`
  - Comment self-ref: `"CommentReplies"`

### Constraint Decisions
- **Faculty.userId / Student.userId**: Added `@unique` to enable one-to-one relation with User (matches Laravel `hasOne` intent even though migration doesn't add DB unique constraint)
- **39 Cascade deletes**: Match all `onDelete('cascade')` from Laravel migrations
- **7 SetNull deletes**: Match all `onDelete('set null')` from Laravel migrations (approved_by_user_id, program_id/department_id on templates, template_item_id on milestones, resolved_by_user_id on flags)
- **35 indexes**: All explicit `$table->index()` from migrations preserved
- **8 unique compound constraints**: All `$table->unique([...])` preserved

### Enum Strategy
- 16 enums defined, matching exact DB values from Laravel migrations
- Enum values use exact DB string values (e.g., `under_review`, `CO_ADVISOR`, `ai_generated`)
- No @map needed on enum values since they match DB exactly

### Timestamps
- `createdAt DateTime @default(now()) @map("created_at")` — matches Eloquent auto-set behavior
- `updatedAt DateTime @updatedAt @map("updated_at")` — Prisma auto-updates on save
- Exception: `PasswordResetToken.createdAt` is nullable (matches Laravel migration)
- Exception: `Session` has no timestamps (matches Laravel migration)

### Notable Edge Cases
- `personal_access_tokens`: Polymorphic `tokenable_type`/`tokenable_id` kept as plain fields with composite index
- `email_verifications`: Final schema after fix migration + magic_token addition (no user_id, uses email instead)
- `projects.slug`: `@db.VarChar(20)` nullable unique with separate index
- `projects`: Consolidates fields from 5 separate migrations (base + approval + custom_members + AI + slug + milestone_template)

---

## Theme, Providers & i18n Decisions (Task 3)

### File Placement
- `colorPalette.ts` stays in `src/styles/theme/` (not `src/styles/`) because `fahrasTheme.ts` uses relative import `./colorPalette`
- Config files in `src/config/`, providers in `src/providers/`, types in `src/types/`

### Environment Variable Migration
- All `import.meta.env.DEV` replaced with `process.env.NODE_ENV !== 'production'`
- Development URL changed from `localhost:5173` to `localhost:3000` (Next.js default)
- No `VITE_*` env vars present in any migrated file

### ThemeContext Decoupled from Auth Store
- Original `ThemeContext.tsx` imports `useAuthStore` from `@/features/auth/store` (Zustand)
- Auth store won't exist until Task 18, so ThemeProvider accepts optional `userRoles` prop instead
- `getDashboardTheme()` always returns unified theme regardless of role, so this is safe
- When auth store is created (Task 18), parent component can pass `user.roles` as prop

### EmotionCacheProvider (New File)
- Created `src/providers/EmotionCacheProvider.tsx` — does not exist in SPA
- Handles Emotion SSR style injection via `useServerInsertedHTML` from `next/navigation`
- Dynamically switches between LTR and RTL cache keys (`mui` vs `muirtl`)
- Uses `stylis-plugin-rtl` + `prefixer` for RTL direction
- `@emotion/cache` is a transitive dependency from `@emotion/react` (not added as direct dep)

### Provider Composition Architecture
- Created `src/providers/Providers.tsx` as a single client-side wrapper
- Nesting order: `LanguageProvider` → `InnerProviders` (reads direction) → `EmotionCacheProvider` → `MuiThemeProvider` → `CssBaseline` → `ThemeProvider`
- `InnerProviders` is a separate component because it needs `useLanguage()` hook (must be inside `LanguageProvider`)
- `createFahrasTheme(direction)` called inside `InnerProviders` to get direction-aware MUI theme

### Root Layout
- `src/app/layout.tsx` is a Server Component (for metadata export)
- Wraps children with `<Providers>` client component
- Imports `@/styles/accessibility.css` and `./globals.css`
- `suppressHydrationWarning` on `<html>` to prevent mismatch from LanguageProvider setting `dir`/`lang` on client
- Static `lang="en" dir="ltr"` as SSR defaults; client-side LanguageProvider updates from localStorage

### Files Created (Task 3 Complete)
1. `src/styles/theme/colorPalette.ts` — exact copy
2. `src/styles/theme/fahrasTheme.ts` — comments stripped
3. `src/styles/designTokens.ts` — exact copy
4. `src/styles/accessibility.css` — exact copy
5. `src/i18n/translations.ts` — exact copy (Unicode escapes)
6. `src/types/organization-config.ts` — exact copy
7. `src/config/organization.ts` — `import.meta.env.DEV` → `process.env.NODE_ENV`
8. `src/config/dashboardThemes.ts` — import path updated
9. `src/providers/LanguageContext.tsx` — `'use client'` added
10. `src/providers/ThemeContext.tsx` — `'use client'` added, auth store decoupled
11. `src/providers/EmotionCacheProvider.tsx` — new file for Next.js SSR
12. `src/providers/Providers.tsx` — new composition wrapper
13. `src/app/layout.tsx` — updated with providers + CSS imports

