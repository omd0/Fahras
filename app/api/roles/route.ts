import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };

export const GET = withRole('admin', async () => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissionRoles: {
          include: { permission: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedRoles = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isSystemRole: role.isSystemRole,
      isTemplate: role.isTemplate,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.permissionRoles.map((pr) => ({
        id: pr.permission.id,
        code: pr.permission.code,
        category: pr.permission.category,
        description: pr.permission.description,
        scope: pr.scope,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: formattedRoles,
      count: formattedRoles.length,
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch roles',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});

export const POST = withRole('admin', async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required field: name',
        },
        { status: 422 }
      );
    }

    const existingRole = await prisma.role.findUnique({
      where: { name: body.name },
    });

    if (existingRole) {
      return NextResponse.json(
        {
          success: false,
          message: 'Role name already exists',
        },
        { status: 422 }
      );
    }

    const role = await prisma.$transaction(async (tx) => {
      const newRole = await tx.role.create({
        data: {
          name: body.name,
          description: body.description || null,
          isSystemRole: false,
          isTemplate: body.isTemplate || false,
        },
      });

      if (body.permissions && Array.isArray(body.permissions)) {
        await Promise.all(
          body.permissions.map((perm: { permissionId: number; scope?: string }) =>
            tx.permissionRole.create({
              data: {
                roleId: newRole.id,
                permissionId: perm.permissionId,
                scope: (perm.scope as 'all' | 'department' | 'own' | 'none') || 'all',
              },
            })
          )
        );
      }

      return newRole;
    });

    const createdRole = await prisma.role.findUnique({
      where: { id: role.id },
      include: {
        permissionRoles: {
          include: { permission: true },
        },
      },
    });

    if (!createdRole) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch created role',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: createdRole.id,
          name: createdRole.name,
          description: createdRole.description,
          isSystemRole: createdRole.isSystemRole,
          isTemplate: createdRole.isTemplate,
          createdAt: createdRole.createdAt,
          updatedAt: createdRole.updatedAt,
          permissions: createdRole.permissionRoles.map((pr) => ({
            id: pr.permission.id,
            code: pr.permission.code,
            category: pr.permission.category,
            description: pr.permission.description,
            scope: pr.scope,
          })),
        },
        message: 'Role created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create role',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
