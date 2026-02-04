import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };
type RouteContext = { params: Promise<Record<string, string>> };

export const GET = withRole('admin', async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { id } = await ctx.params;
    const roleId = parseInt(id, 10);

    if (isNaN(roleId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role ID' },
        { status: 400 }
      );
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissionRoles: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch role',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});

export const PUT = withRole('admin', async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { id } = await ctx.params;
    const roleId = parseInt(id, 10);

    if (isNaN(roleId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role ID' },
        { status: 400 }
      );
    }

    const body = await req.json();

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }

    if (role.isSystemRole) {
      return NextResponse.json(
        { success: false, message: 'Cannot modify system roles' },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: { id: roleId },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.isTemplate !== undefined && { isTemplate: body.isTemplate }),
        },
      });

      if (body.permissions && Array.isArray(body.permissions)) {
        await tx.permissionRole.deleteMany({ where: { roleId } });
        await Promise.all(
          body.permissions.map((perm: { permissionId: number; scope?: string }) =>
            tx.permissionRole.create({
              data: {
                roleId,
                permissionId: perm.permissionId,
                scope: (perm.scope as 'all' | 'department' | 'own' | 'none') || 'all',
              },
            })
          )
        );
      }
    });

    const roleWithPermissions = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissionRoles: {
          include: { permission: true },
        },
      },
    });

    if (!roleWithPermissions) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch updated role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: roleWithPermissions.id,
        name: roleWithPermissions.name,
        description: roleWithPermissions.description,
        isSystemRole: roleWithPermissions.isSystemRole,
        isTemplate: roleWithPermissions.isTemplate,
        createdAt: roleWithPermissions.createdAt,
        updatedAt: roleWithPermissions.updatedAt,
        permissions: roleWithPermissions.permissionRoles.map((pr) => ({
          id: pr.permission.id,
          code: pr.permission.code,
          category: pr.permission.category,
          description: pr.permission.description,
          scope: pr.scope,
        })),
      },
      message: 'Role updated successfully',
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update role',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});

export const DELETE = withRole('admin', async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { id } = await ctx.params;
    const roleId = parseInt(id, 10);

    if (isNaN(roleId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role ID' },
        { status: 400 }
      );
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }

    if (role.isSystemRole) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete system roles' },
        { status: 403 }
      );
    }

    const userCount = await prisma.roleUser.count({
      where: { roleId },
    });

    if (userCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete role that is assigned to users' },
        { status: 422 }
      );
    }

    await prisma.role.delete({
      where: { id: roleId },
    });

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete role',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
