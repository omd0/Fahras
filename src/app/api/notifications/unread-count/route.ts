import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };

/**
 * GET /api/notifications/unread-count
 * Returns the count of unread notifications for the authenticated user
 * Requires authentication
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = parseInt(req.session.user.id, 10);

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return NextResponse.json({
      unread_count: unreadCount,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch unread count',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
