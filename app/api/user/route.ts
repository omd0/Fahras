import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: {
        roleUsers: {
          include: {
            role: {
              include: {
                permissionRoles: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        emailVerifiedAt: user.emailVerifiedAt,
        roles: user.roleUsers.map((ru: any) => ru.role),
        permissions: user.roleUsers.flatMap((ru: any) => 
          ru.role.permissionRoles.map((pr: any) => pr.permission)
        ),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user', error: String(error) },
      { status: 500 }
    );
  }
}
