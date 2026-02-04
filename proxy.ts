import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy for Route Protection
 * 
 * This proxy runs on Node.js runtime (not Edge Runtime) and handles:
 * - Authentication checks for protected routes
 * - Role-based access control
 * - Public route allowlisting
 * - Legacy URL redirects (/projects/:id → /pr/:id)
 */

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/home',
  '/explore',
  '/bookmarks',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/terms',
  '/privacy',
  '/test-auth',
];

// Routes that require specific roles
const ROLE_PROTECTED_ROUTES: Record<string, string[]> = {
  '/admin': ['admin'],
  '/admin/approvals': ['admin'],
  '/access-control': ['admin'],
  '/milestone-templates': ['admin'],
  '/users': ['admin'],
  '/evaluations': ['faculty', 'admin'],
  '/advisor-projects': ['faculty'],
  '/faculty/pending-approvals': ['faculty'],
  '/student/my-projects': ['student'],
};

// Routes that require authentication but no specific role
const AUTH_REQUIRED_ROUTES = [
  '/dashboard',
  '/analytics',
  '/profile',
  '/settings',
  '/notifications',
  '/pr/create',
  '/pr/',
];

/**
 * Check if a route is public (no auth required)
 */
function isPublicRoute(pathname: string): boolean {
  // Exact match for public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  // Allow project detail pages (guest access)
  if (pathname.match(/^\/pr\/[a-z0-9]+$/i)) {
    return true;
  }

  // Allow project code viewer (guest access)
  if (pathname.match(/^\/pr\/[a-z0-9]+\/code/i)) {
    return true;
  }

  return false;
}

/**
 * Check if a route requires authentication
 */
function requiresAuth(pathname: string): boolean {
  // Check exact matches
  if (AUTH_REQUIRED_ROUTES.some((route) => pathname === route || pathname.startsWith(route))) {
    return true;
  }

  // Check role-protected routes
  if (Object.keys(ROLE_PROTECTED_ROUTES).some((route) => pathname.startsWith(route))) {
    return true;
  }

  // Project edit/follow routes require auth
  if (pathname.match(/^\/pr\/[a-z0-9]+\/(edit|follow)$/i)) {
    return true;
  }

  return false;
}

/**
 * Get required roles for a route
 */
function getRequiredRoles(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(ROLE_PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

/**
 * Check if user has required role
 */
function userHasRole(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Main proxy function for Next.js 16
 * Runs on Node.js runtime with full Node.js API access
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes and static files to pass through
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Legacy redirect: /projects/:id → /pr/:id
  const projectsMatch = pathname.match(/^\/projects\/(.+)$/);
  if (projectsMatch) {
    const id = projectsMatch[1];
    return NextResponse.redirect(new URL(`/pr/${id}`, request.url));
  }

  // Legacy redirect: /project/:id → /pr/:id
  const projectMatch = pathname.match(/^\/project\/(.+)$/);
  if (projectMatch) {
    const id = projectMatch[1];
    return NextResponse.redirect(new URL(`/pr/${id}`, request.url));
  }

  // Public routes - allow without authentication
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get session for protected routes
  const session = await auth();

  // Protected routes - require authentication
  if (requiresAuth(pathname)) {
    if (!session?.user) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    const requiredRoles = getRequiredRoles(pathname);
    if (requiredRoles && !userHasRole(session.user.roles ?? [], requiredRoles)) {
      // User doesn't have required role - redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Allow request to proceed
  return NextResponse.next();
}

/**
 * Configure which routes the proxy should handle
 * Excludes API routes, static files, and Next.js internals
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
