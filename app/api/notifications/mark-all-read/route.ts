import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };

/**
 * POST /api/notifications/mark-all-read
 * Marks all unread notifications as read for the authenticated user
 * Requires authentication
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = parseInt(req.session.user.id, 10);

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      {
        message: 'Failed to mark notifications as read',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
