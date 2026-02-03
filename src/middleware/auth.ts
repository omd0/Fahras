import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

type RouteContext = { params: Promise<Record<string, string>> };

type AuthenticatedRequest = NextRequest & { session: Session };

type ApiHandler = (
  req: NextRequest,
  ctx: RouteContext
) => Promise<NextResponse>;

type AuthenticatedApiHandler = (
  req: AuthenticatedRequest,
  ctx: RouteContext
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedApiHandler): ApiHandler {
  return async (req: NextRequest, ctx: RouteContext) => {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.session = session;
    return handler(authenticatedReq, ctx);
  };
}

export function withRole(
  roles: string | string[],
  handler: AuthenticatedApiHandler
): ApiHandler {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return withAuth(async (req, ctx) => {
    const userRoles = req.session.user.roles ?? [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    return handler(req, ctx);
  });
}

export function withOptionalAuth(
  handler: (
    req: NextRequest & { session: Session | null },
    ctx: RouteContext
  ) => Promise<NextResponse>
): ApiHandler {
  return async (req: NextRequest, ctx: RouteContext) => {
    const session = await auth();
    const extendedReq = req as NextRequest & { session: Session | null };
    extendedReq.session = session ?? null;
    return handler(extendedReq, ctx);
  };
}
