import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };
type RouteContext = { params: Promise<Record<string, string>> };

/**
 * POST /api/milestones/[id]/start
 * Starts a milestone (transitions from pending to in_progress)
 * Requires authentication and project membership
 */
export const POST = withAuth(async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { id } = await ctx.params;
    const milestoneId = parseInt(id, 10);
    const userId = parseInt(req.session.user.id, 10);

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

    // Check if milestone can be started
    if (milestone.status === 'in_progress') {
      return NextResponse.json(
        { message: 'Milestone is already in progress' },
        { status: 422 }
      );
    }

    if (milestone.status === 'completed') {
      return NextResponse.json(
        { message: 'Cannot start a completed milestone. Use reopen instead.' },
        { status: 422 }
      );
    }

    // Check if dependencies are met
    if (Array.isArray(milestone.dependencies) && milestone.dependencies.length > 0) {
      const incompleteDeps = await prisma.projectMilestone.findMany({
        where: {
          projectId: milestone.projectId,
          id: {
            in: milestone.dependencies.map((d) => (typeof d === 'number' ? d : parseInt(String(d), 10))),
          },
          status: { not: 'completed' },
        },
        select: { id: true, title: true },
      });

      if (incompleteDeps.length > 0) {
        return NextResponse.json(
          {
            message: 'Cannot start milestone. Dependencies not met.',
            incomplete_dependencies: incompleteDeps.map((m) => m.title),
          },
          { status: 422 }
        );
      }
    }

    const updatedMilestone = await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        status: 'in_progress',
        startedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Milestone started successfully',
      data: updatedMilestone,
    });
  } catch (error) {
    console.error('Error starting milestone:', error);
    return NextResponse.json(
      {
        message: 'Failed to start milestone',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
