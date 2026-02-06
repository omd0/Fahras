import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withOptionalAuth } from '@/middleware/auth';
import type { Session } from 'next-auth';

export const GET = withOptionalAuth(
  async (
    req: NextRequest & { session: Session | null },
    ctx: { params: Promise<Record<string, string>> }
  ) => {
    const params = await ctx.params;
    const slug = params.slug as string;

    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true, isPublic: true, createdByUserId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const userId = req.session?.user?.id ? parseInt(req.session.user.id as string) : null;
    if (!project.isPublic && userId !== project.createdByUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [activities, milestones, statusChanges] = await Promise.all([
      prisma.projectActivity.findMany({
        where: { projectId: project.id },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.projectMilestone.findMany({
        where: { projectId: project.id },
        include: {
          templateItem: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      }),
      prisma.projectActivity.findMany({
        where: {
          projectId: project.id,
          activityType: 'status_change',
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const activitiesByDate = activities.reduce(
      (acc, activity) => {
        const date = activity.createdAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(activity);
        return acc;
      },
      {} as Record<string, typeof activities>
    );

    return NextResponse.json({
      activities_by_date: activitiesByDate,
      milestones,
      status_changes: statusChanges,
    });
  }
);
