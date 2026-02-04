# NextJS Migration - Learnings & Patterns

## API Route Implementation Patterns

### Permission Route (`/api/permissions`)
**Status**: ✅ COMPLETED

**Key Learnings**:
1. **Auth Error Handling**: Use `AuthError` class with statusCode for proper error propagation
   - 401: Authentication required (no session)
   - 403: Insufficient permissions (wrong role)

2. **Prisma Include Pattern**: Always include relations when fetching permissions
   ```typescript
   permissionRoles: {
     include: { role: true }
   }
   ```

3. **Response Format**: Consistent JSON structure with success flag
   ```typescript
   {
     success: true,
     data: [...],
     count: number
   }
   ```

4. **Error Handling**: Distinguish between AuthError and other errors
   - AuthError: Check statusCode and return appropriate HTTP status
   - Other errors: Log and return 500 with optional debug info

5. **Build Warnings**: NextAuth routes may show prerendering warnings during build
   - These are expected for dynamic auth routes
   - Build completes successfully despite warnings

## Permission System Architecture

### Models & Relations
- **Permission**: code (unique), category (enum), description
- **Role**: name (unique), isSystemRole, isTemplate
- **PermissionRole**: pivot table with scope field (all, department, own, none)
- **User → Role → Permission**: Many-to-many relationships

### Permission Categories (7)
- Projects, Users, Files, Analytics, Settings, System, Roles

### Permission Scopes (4)
- `all`: Global access
- `department`: Department-level access
- `own`: Own resources only
- `none`: No access

### Default Roles
- **Admin**: All permissions with `all` scope
- **Faculty**: User/Project/File permissions with appropriate scopes
- **Student**: Limited project and file permissions
- **Reviewer**: Read-only permissions

## TypeScript & Build Patterns

### Type Safety
- Use `AuthError` class for typed error handling
- Import types from `@/lib/auth-helpers` and `@/lib/prisma`
- Always type NextRequest/NextResponse

### Build Process
- `npx tsc --noEmit`: Validates TypeScript without emitting files
- `npm run build`: Full Next.js build with Turbopack
- Build includes route compilation and static generation
- Dynamic routes (like `/api/permissions`) are marked as `ƒ` (server-rendered on demand)

## Next Steps for Related Routes

When implementing other admin routes:
1. Use same `requireRole(['admin'])` pattern
2. Include relations for nested data (roles with permissions, users with roles)
3. Support pagination with query params (page, limit)
4. Use Prisma transactions for multi-step operations
5. Return consistent response format with success flag
6. Handle 401/403/404/422/500 status codes appropriately

## Code Quality Notes

- Comments are necessary for error handling logic (distinguish between auth types)
- Always provide fallback values in responses
- Use `process.env.NODE_ENV === 'development'` for debug info
- Log errors with context for debugging

## [2026-02-04] Task 6: RBAC Middleware & Constants

**Status**: ✅ COMPLETED (Direct implementation by orchestrator)

**Files Created** (6 total):
1. `src/constants/approval-status.ts` — 704 bytes
2. `src/constants/project-status.ts` — 1.1 KB
3. `src/constants/member-role.ts` — 428 bytes
4. `src/constants/advisor-role.ts` — 526 bytes
5. `src/constants/permissions.ts` — 1.7 KB
6. `src/middleware/rbac.ts` — 2.8 KB

**Key Patterns**:
1. **Enum + Labels Pattern**: Each constant file exports enum + labels object + validator function
2. **Permission Scopes**: ALL (global), DEPARTMENT (dept-level), OWN (own resources), NONE (no access)
3. **RBAC Functions**: 8 functions exported (checkPermission, checkRole, 4 role helpers, getPermissionScope, filterByScope)
4. **Type Safety**: PermissionCode derived from const array for exhaustive checking
5. **Nullable-Safe**: All RBAC functions handle null/undefined user gracefully

**Verification**:
- ✅ ESLint: Zero warnings
- ✅ TypeScript: New files have zero errors (existing API route errors unrelated)
- ✅ All 6 files exist with expected sizes

**Implementation Decision**:
- Orchestrator created files directly (not via subagent) due to previous subagent failures (see problems.md)
- Simple, mechanical work with no complex logic
- Unblocks Wave 3 (10 parallel API tasks)

