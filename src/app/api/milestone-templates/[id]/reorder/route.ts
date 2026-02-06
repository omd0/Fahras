import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };
type RouteContext = { params: Promise<Record<string, string>> };

/**
 * POST /api/milestone-templates/[id]/reorder
 * Reorders items within a milestone template
 * Body: { items: [{ id, order }, ...] }
 * Requires admin role
 */
export const POST = withRole('admin', async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { id } = await ctx.params;
    const templateId = parseInt(id, 10);
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: { items: 'Items array is required and must not be empty' },
        },
        { status: 422 }
      );
    }

    const template = await prisma.milestoneTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { message: 'Milestone template not found' },
        { status: 404 }
      );
    }

    // Validate all items belong to the template
    const itemIds = items.map((item: Record<string, unknown>) => Number(item.id));
    const itemsInTemplate = await prisma.milestoneTemplateItem.count({
      where: {
        templateId,
        id: { in: itemIds },
      },
    });

    if (itemsInTemplate !== itemIds.length) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: { items: 'Some items do not belong to this template' },
        },
        { status: 422 }
      );
    }

    // Update all items in a transaction
    await Promise.all(
      items.map((item: Record<string, unknown>) =>
        prisma.milestoneTemplateItem.update({
          where: { id: Number(item.id) },
          data: { order: Number(item.order) },
        })
      )
    );

    const updatedTemplate = await prisma.milestoneTemplate.findUnique({
      where: { id: templateId },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({
      message: 'Items reordered successfully',
      data: updatedTemplate,
    });
  } catch (error) {
    console.error('Error reordering milestone template items:', error);
    return NextResponse.json(
      {
        message: 'Failed to reorder items',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
