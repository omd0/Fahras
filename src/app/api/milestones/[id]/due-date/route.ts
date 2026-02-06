import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };
type RouteContext = { params: Promise<Record<string, string>> };

/**
 * PUT /api/milestones/[id]/due-date
 * Updates the due date of a milestone
 * Body: { due_date: "YYYY-MM-DD" }
 * Requires authentication and project membership
 */
export const PUT = withAuth(async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { id } = await ctx.params;
    const milestoneId = parseInt(id, 10);
    const userId = parseInt(req.session.user.id, 10);
    const body = await req.json();
    const { due_date, dueDate } = body;

    const dateStr = due_date || dueDate;
    if (!dateStr) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: { due_date: 'Due date is required' },
        },
        { status: 422 }
      );
    }

    const milestone = await prisma.projectMilestone.findUnique({
      where: { id: milestoneId },
      include: { project: true },
    });

    if (!milestone) {
      return NextResponse.json(
        { message: 'Milestone not found' },
        { status: 404 }
      );
    }

    // Check if user is project creator or member
    const isCreator = milestone.project.createdByUserId === userId;
    const isMember = await prisma.projectMember.findFirst({
      where: {
        projectId: milestone.projectId,
        userId,
      },
    });

    if (!isCreator && !isMember) {
      return NextResponse.json(
        { message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const newDueDate = new Date(dateStr);
    if (isNaN(newDueDate.getTime())) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: { due_date: 'Invalid date format' },
        },
        { status: 422 }
      );
    }

    const updatedMilestone = await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        dueDate: newDueDate,
      },
    });

    return NextResponse.json({
      message: 'Due date updated successfully',
      data: updatedMilestone,
    });
  } catch (error) {
    console.error('Error updating milestone due date:', error);
    return NextResponse.json(
      {
        message: 'Failed to update due date',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
