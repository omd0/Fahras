# src/app/api/ — API ROUTES

52 Next.js route handlers. RESTful, slug-based project URLs, Prisma ORM, custom auth middleware.

## STRUCTURE

```
api/
├── auth/[...nextauth]/     # NextAuth handler (delegates to src/lib/auth.ts)
├── login/                  # POST — Credentials login
├── register/               # POST — User registration
├── user/                   # GET — Current user profile
├── admin/users/            # CRUD + [id]/toggle-status
├── projects/               # GET (list+search), POST (create)
│   ├── [slug]/             # GET, PUT, DELETE single project
│   │   ├── activities/     # GET activity feed
│   │   ├── approve/        # POST admin approval
│   │   ├── bookmark/       # POST toggle
│   │   ├── comments/       # GET/POST
│   │   ├── files/          # GET/POST (multipart upload)
│   │   ├── flags/          # GET/POST project flags
│   │   ├── follow/         # POST toggle
│   │   ├── followers/      # GET follower list
│   │   ├── hide/           # POST admin hide
│   │   ├── ratings/        # GET/POST
│   │   ├── timeline/       # GET milestone timeline
│   │   └── visibility/     # PATCH toggle public/private
│   ├── admin/              # GET admin project list
│   ├── analytics/          # GET project stats
│   └── suggestions/        # GET autocomplete
├── bookmarks/              # GET list, sync/
├── milestones/[id]/        # PATCH + start/ complete/ reopen/ due-date/
├── milestone-templates/    # CRUD + [id]/reorder
├── notifications/          # GET list + [id]/read, mark-all-read, delete-all, unread-count
├── roles/                  # CRUD + [id]
├── permissions/            # GET all
├── departments/            # GET all
├── faculties/              # GET all
├── programs/               # GET all
├── tags/                   # GET all
├── saved-searches/         # CRUD + [id]
├── search-queries/         # GET popular queries
└── files/[id]/             # GET metadata + download/
```

## ROUTE PATTERN

Every route file exports named HTTP method handlers wrapped in middleware:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };
type RouteContext = { params: Promise<Record<string, string>> };

// Protected endpoint
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const userId = parseInt(req.session.user.id, 10);
  // ... Prisma query ...
  return NextResponse.json({ data });
});

// Admin-only endpoint
export const POST = withRole('admin', async (req: AuthenticatedRequest, ctx: RouteContext) => {
  const { slug } = await ctx.params;  // Dynamic params are async in Next.js 16
  // ...
});
```

## MIDDLEWARE WRAPPERS

Three wrappers in `@/middleware/auth`:

| Wrapper | Auth | Use |
|---------|------|-----|
| `withAuth(handler)` | Required | User must be logged in |
| `withRole(roles, handler)` | Required + role check | Admin/faculty-only endpoints |
| `withOptionalAuth(handler)` | Optional | Public routes that behave differently when authenticated |

Session available as `req.session` after wrapping. User ID: `parseInt(req.session.user.id, 10)`. Roles: `req.session.user.roles`.

## CONVENTIONS

**Dynamic params** — Always `await ctx.params` (async in Next.js 16):
```typescript
const { slug } = await ctx.params;
const { id } = await ctx.params;
```

**Pagination** — Standard response shape:
```typescript
return NextResponse.json({
  data: items,
  current_page: page,
  last_page: Math.ceil(total / perPage),
  per_page: perPage,
  total,
  has_more_pages: page < lastPage,
});
```

**Error handling** — Try/catch with dev-only details:
```typescript
catch (error) {
  console.error('Context:', error);
  return NextResponse.json(
    { message: 'User-facing message',
      ...(process.env.NODE_ENV === 'development' && { error: String(error) }) },
    { status: 500 }
  );
}
```

**Prisma includes** — Define reusable include objects at file top:
```typescript
const projectIncludes = {
  creator: { select: { id: true, fullName: true, email: true } },
  program: { include: { department: true } },
  // ...
};
```

**Slug + ID fallback** — Project lookups try slug first, then numeric ID:
```typescript
let project = await prisma.project.findUnique({ where: { slug } });
if (!project && /^\d+$/.test(slug)) {
  project = await prisma.project.findUnique({ where: { id: parseInt(slug, 10) } });
}
```

## ANTI-PATTERNS

- **NEVER skip middleware** — Every non-public route MUST use `withAuth` or `withRole`
- **NEVER use `handleApiError`** from api-utils in route handlers — Use inline try/catch (handleApiError is for auth-helpers only)
- **NEVER forget `await ctx.params`** — Params are async Promises in Next.js 16
- **NEVER return raw Prisma errors** — Wrap in user-friendly messages; expose details only in dev
- **NEVER use `parseInt` without fallback** — Query params can be null: `parseInt(x || '1', 10)`
