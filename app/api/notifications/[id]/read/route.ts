import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };

/**
 * POST /api/notifications/[id]/read
 * Marks a single notification as read for the authenticated user
 * Requires authentication and ownership of the notification
 */
export const POST = withAuth(async (req: AuthenticatedRequest, ctx: { params: Promise<Record<string, string>> }) => {
  try {
    const userId = parseInt(req.session.user.id, 10);
    const { id } = await ctx.params;
    const notificationId = parseInt(id, 10);

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json(
        { message: 'Notification not found' },
        { status: 404 }
      );
    }

    if (notification.userId !== userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({
      message: 'Notification marked as read',
      data: updated,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      {
        message: 'Failed to mark notification as read',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
