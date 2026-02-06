import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };

/**
 * DELETE /api/notifications/[id]
 * Deletes a single notification for the authenticated user
 * Requires authentication and ownership of the notification
 */
export const DELETE = withAuth(async (req: AuthenticatedRequest, ctx: { params: Promise<Record<string, string>> }) => {
  try {
    const userId = parseInt(req.session.user.id, 10);
    const params = await ctx.params;
    const notificationId = parseInt(params.id, 10);

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

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      {
        message: 'Failed to delete notification',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
