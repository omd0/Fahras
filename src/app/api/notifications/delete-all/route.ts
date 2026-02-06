import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };

/**
 * POST /api/notifications/delete-all
 * Deletes all notifications for the authenticated user
 * Requires authentication
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
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
