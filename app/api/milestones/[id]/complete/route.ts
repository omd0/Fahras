import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };
type RouteContext = { params: Promise<Record<string, string>> };

/**
 * POST /api/milestones/[id]/complete
 * Marks a milestone as completed
 * Requires authentication and project membership
 */
export const POST = withAuth(async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { id } = await ctx.params;
    const milestoneId = parseInt(id, 10);
    const userId = parseInt(req.session.user.id, 10);
    const body = await req.json();
    const { completionNotes } = body;

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

    // Check if milestone can be completed
    if (milestone.status === 'completed') {
      return NextResponse.json(
        { message: 'Milestone is already completed' },
        { status: 422 }
      );
    }

    const updatedMilestone = await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        completionNotes: completionNotes || null,
      },
    });

    return NextResponse.json({
      message: 'Milestone completed successfully',
      data: updatedMilestone,
    });
  } catch (error) {
    console.error('Error completing milestone:', error);
    return NextResponse.json(
      {
        message: 'Failed to complete milestone',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
