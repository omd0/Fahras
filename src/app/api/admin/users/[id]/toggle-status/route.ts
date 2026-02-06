import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };
type RouteContext = { params: Promise<Record<string, string>> };

export const POST = withRole('admin', async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { id } = await ctx.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body.status) {
      return NextResponse.json(
        { success: false, message: 'Status field is required' },
        { status: 422 }
      );
    }

    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value' },
        { status: 422 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: body.status },
      include: {
        roleUsers: {
          include: { role: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        status: updatedUser.status,
        emailVerifiedAt: updatedUser.emailVerifiedAt,
        lastLoginAt: updatedUser.lastLoginAt,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        roles: updatedUser.roleUsers.map((ru) => ({
          id: ru.role.id,
          name: ru.role.name,
          description: ru.role.description,
        })),
      },
      message: 'User status updated successfully',
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to toggle user status',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
