import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };

/**
 * GET /api/notifications
 * Returns paginated notifications for the authenticated user
 * Query params: page (default: 1), per_page (default: 15, max: 100)
 * Requires authentication
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = parseInt(req.session.user.id, 10);
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
    const perPage = Math.min(parseInt(req.nextUrl.searchParams.get('per_page') || '15', 10), 100);

    const skip = (page - 1) * perPage;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    const lastPage = Math.ceil(total / perPage);

    return NextResponse.json({
      data: notifications,
      pagination: {
        current_page: page,
        per_page: perPage,
        total,
        last_page: lastPage,
        has_more_pages: page < lastPage,
      },
      unread_count: unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch notifications',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/notifications
 * Deletes all notifications for the authenticated user
 * Requires authentication
 */
export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = parseInt(req.session.user.id, 10);

    await prisma.notification.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      message: 'All notifications deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    return NextResponse.json(
      {
        message: 'Failed to delete notifications',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
