import { NextResponse } from 'next/server';
import { withRole } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';

export const GET = withRole('admin', async () => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ category: 'asc' }, { code: 'asc' }],
      include: {
        permissionRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    const formattedPermissions = permissions.map((permission) => ({
      id: permission.id,
      code: permission.code,
      category: permission.category,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
      roles: permission.permissionRoles.map((pr) => ({
        id: pr.role.id,
        name: pr.role.name,
        scope: pr.scope,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: formattedPermissions,
      count: formattedPermissions.length,
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch permissions',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
