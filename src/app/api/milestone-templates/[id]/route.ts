import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };
type RouteContext = { params: Promise<Record<string, string>> };

/**
 * GET /api/milestone-templates/[id]
 * Returns a specific milestone template with its items
 * Requires admin role
 */
export const GET = withRole('admin', async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { id } = await ctx.params;
    const templateId = parseInt(id, 10);

    const template = await prisma.milestoneTemplate.findUnique({
      where: { id: templateId },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
        program: true,
        department: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { message: 'Milestone template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: template,
    });
  } catch (error) {
    console.error('Error fetching milestone template:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch milestone template',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/milestone-templates/[id]
 * Updates a milestone template and its items
 * Requires admin role
 */
export const PUT = withRole('admin', async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { id } = await ctx.params;
    const templateId = parseInt(id, 10);
    const body = await req.json();
    const { name, description, programId, departmentId, isDefault, items } = body;

    const template = await prisma.milestoneTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { message: 'Milestone template not found' },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults in same scope
    if (isDefault) {
      const where: Record<string, unknown> = { isDefault: true, id: { not: templateId } };
      if (programId !== undefined) {
        where.programId = programId;
      } else {
        where.programId = null;
      }
      if (departmentId !== undefined) {
        where.departmentId = departmentId;
      } else {
        where.departmentId = null;
      }

      await prisma.milestoneTemplate.updateMany({
        where,
        data: { isDefault: false },
      });
    }

    // Update template
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (programId !== undefined) updateData.programId = programId;
    if (departmentId !== undefined) updateData.departmentId = departmentId;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    // Handle items update if provided
    if (Array.isArray(items)) {
      // Delete items not in the new list
      const newItemIds = items
        .filter((item: Record<string, unknown>) => item.id)
        .map((item: Record<string, unknown>) => Number(item.id));

      await prisma.milestoneTemplateItem.deleteMany({
        where: {
          templateId,
          id: { notIn: newItemIds },
        },
      });

      // Update or create items
      for (const item of items) {
        const itemData = item as Record<string, unknown>;
        if (itemData.id) {
          await prisma.milestoneTemplateItem.update({
            where: { id: Number(itemData.id) },
            data: {
              title: String(itemData.title),
              description: itemData.description ? String(itemData.description) : null,
              estimatedDays: Number(itemData.estimated_days || itemData.estimatedDays || 0),
              order: itemData.order !== undefined ? Number(itemData.order) : 0,
            },
          });
        } else {
          await prisma.milestoneTemplateItem.create({
            data: {
              templateId,
              title: String(itemData.title),
              description: itemData.description ? String(itemData.description) : null,
              estimatedDays: Number(itemData.estimated_days || itemData.estimatedDays || 0),
              order: itemData.order !== undefined ? Number(itemData.order) : 0,
            },
          });
        }
      }
    }

    const updatedTemplate = await prisma.milestoneTemplate.update({
      where: { id: templateId },
      data: updateData,
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
        program: true,
        department: true,
      },
    });

    return NextResponse.json({
      message: 'Milestone template updated successfully',
      data: updatedTemplate,
    });
  } catch (error) {
    console.error('Error updating milestone template:', error);
    return NextResponse.json(
      {
        message: 'Failed to update milestone template',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/milestone-templates/[id]
 * Deletes a milestone template
 * Requires admin role
 */
export const DELETE = withRole('admin', async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { id } = await ctx.params;
    const templateId = parseInt(id, 10);

    const template = await prisma.milestoneTemplate.findUnique({
      where: { id: templateId },
      include: { projects: true },
    });

    if (!template) {
      return NextResponse.json(
        { message: 'Milestone template not found' },
        { status: 404 }
      );
    }

    // Check if template is being used by any projects
    if (template.projects.length > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete template. It is being used by ${template.projects.length} project(s).`,
        },
        { status: 422 }
      );
    }

    await prisma.milestoneTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json({
      message: 'Milestone template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting milestone template:', error);
    return NextResponse.json(
      {
        message: 'Failed to delete milestone template',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
