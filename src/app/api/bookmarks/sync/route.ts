import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };

/**
 * POST /api/bookmarks/sync
 * Sync guest bookmarks from cookies to authenticated user account
 * Reads guest_bookmarks cookie (JSON array of project IDs)
 * Creates bookmarks for authenticated user, then clears cookie
 * Requires authentication
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = parseInt(req.session.user.id, 10);

    const cookieHeader = req.headers.get('cookie') || '';
    let guestBookmarkIds: number[] = [];

    const cookieMatch = cookieHeader.match(/guest_bookmarks=([^;]+)/);
    if (cookieMatch) {
      try {
        const decoded = decodeURIComponent(cookieMatch[1]);
        const parsed = JSON.parse(decoded);
        if (Array.isArray(parsed)) {
          guestBookmarkIds = parsed.map((id) => Number(id)).filter((id) => !isNaN(id));
        }
      } catch {
        // Invalid cookie format, skip
      }
    }

    if (guestBookmarkIds.length === 0) {
      return NextResponse.json({
        message: 'No guest bookmarks to sync',
        data: { synced: 0 },
      });
    }

    const existingProjects = await prisma.project.findMany({
      where: { id: { in: guestBookmarkIds } },
      select: { id: true },
    });

    const validProjectIds = existingProjects.map((p) => p.id);

    if (validProjectIds.length === 0) {
      return NextResponse.json({
        message: 'No valid projects found',
        data: { synced: 0 },
      });
    }

    const existingBookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
        projectId: { in: validProjectIds },
      },
      select: { projectId: true },
    });

    const existingProjectIds = new Set(existingBookmarks.map((b) => b.projectId));
    const newProjectIds = validProjectIds.filter((id) => !existingProjectIds.has(id));

    if (newProjectIds.length > 0) {
      await prisma.bookmark.createMany({
        data: newProjectIds.map((projectId) => ({
          userId,
          projectId,
        })),
      });
    }

    const response = NextResponse.json({
      message: 'Bookmarks synced successfully',
      data: { synced: newProjectIds.length },
    });

    response.headers.set('Set-Cookie', 'guest_bookmarks=; Max-Age=0; Path=/; SameSite=Lax');

    return response;
  } catch (error) {
    console.error('Error syncing bookmarks:', error);
    return NextResponse.json(
      {
        message: 'Failed to sync bookmarks',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
