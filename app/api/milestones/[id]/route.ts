import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };
type RouteContext = { params: Promise<Record<string, string>> };

/**
 * PUT /api/milestones/[id]
 * Updates a project milestone
 * Requires authentication and project membership
 */
export const PUT = withAuth(async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { id } = await ctx.params;
    const milestoneId = parseInt(id, 10);
    const userId = parseInt(req.session.user.id, 10);
    const body = await req.json();
    const { title, description, dueDate, dependencies, order, completionNotes } = body;

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

    // Validate circular dependencies if provided
    if (Array.isArray(dependencies)) {
      const hasCycle = await checkCircularDependency(
        milestone.projectId,
        dependencies,
        milestoneId
      );
      if (hasCycle) {
        return NextResponse.json(
          { message: 'Circular dependency detected' },
          { status: 422 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (dependencies !== undefined) updateData.dependencies = dependencies;
    if (order !== undefined) updateData.order = order;
    if (completionNotes !== undefined) updateData.completionNotes = completionNotes;

    const updatedMilestone = await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Milestone updated successfully',
      data: updatedMilestone,
    });
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json(
      {
        message: 'Failed to update milestone',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});

async function checkCircularDependency(
  projectId: number,
  dependencies: number[],
  excludeMilestoneId?: number
): Promise<boolean> {
  if (!Array.isArray(dependencies) || dependencies.length === 0) {
    return false;
  }

  const visited = new Set<number>();
  const recursionStack = new Set<number>();

  for (const depId of dependencies) {
    if (await isCyclicUtil(projectId, depId, visited, recursionStack, excludeMilestoneId)) {
      return true;
    }
  }

  return false;
}

async function isCyclicUtil(
  projectId: number,
  milestoneId: number,
  visited: Set<number>,
  recursionStack: Set<number>,
  excludeMilestoneId?: number
): Promise<boolean> {
  if (milestoneId === excludeMilestoneId) {
    return false;
  }

  visited.add(milestoneId);
  recursionStack.add(milestoneId);

  const milestone = await prisma.projectMilestone.findFirst({
    where: {
      projectId,
      id: milestoneId,
    },
  });

  if (milestone && Array.isArray(milestone.dependencies)) {
    for (const dep of milestone.dependencies) {
      const depId = typeof dep === 'number' ? dep : parseInt(String(dep), 10);
      if (!visited.has(depId)) {
        if (await isCyclicUtil(projectId, depId, visited, recursionStack, excludeMilestoneId)) {
          return true;
        }
      } else if (recursionStack.has(depId)) {
        return true;
      }
    }
  }

  recursionStack.delete(milestoneId);
  return false;
}
