import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };
type RouteContext = { params: Promise<Record<string, string>> };

export const GET = withRole('admin', async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { id } = await ctx.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleUsers: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        status: user.status,
        emailVerifiedAt: user.emailVerifiedAt,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roles: user.roleUsers.map((ru) => ({
          id: ru.role.id,
          name: ru.role.name,
          description: ru.role.description,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch user',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});

export const PUT = withRole('admin', async (req: AuthenticatedRequest, ctx: RouteContext) => {
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.fullName) updateData.fullName = body.fullName;
    if (body.email) updateData.email = body.email.toLowerCase().trim();
    if (body.status) updateData.status = body.status;
    if (body.password) updateData.password = await bcryptjs.hash(body.password, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      if (body.roleIds && Array.isArray(body.roleIds)) {
        await tx.roleUser.deleteMany({ where: { userId } });
        await Promise.all(
          body.roleIds.map((roleId: number) =>
            tx.roleUser.create({
              data: { userId, roleId },
            })
          )
        );
      }
    });

    const userWithRoles = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleUsers: {
          include: { role: true },
        },
      },
    });

    if (!userWithRoles) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch updated user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: userWithRoles.id,
        fullName: userWithRoles.fullName,
        email: userWithRoles.email,
        status: userWithRoles.status,
        emailVerifiedAt: userWithRoles.emailVerifiedAt,
        lastLoginAt: userWithRoles.lastLoginAt,
        createdAt: userWithRoles.createdAt,
        updatedAt: userWithRoles.updatedAt,
        roles: userWithRoles.roleUsers.map((ru) => ({
          id: ru.role.id,
          name: ru.role.name,
          description: ru.role.description,
        })),
      },
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update user',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});

export const DELETE = withRole('admin', async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { id } = await ctx.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
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

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete user',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
