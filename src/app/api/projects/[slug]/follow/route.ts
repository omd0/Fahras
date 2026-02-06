import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/middleware/auth';
import type { Session } from 'next-auth';

export const POST = withAuth(
  async (
    req: NextRequest & { session: Session },
    ctx: { params: Promise<Record<string, string>> }
  ) => {
    const params = await ctx.params;
    const slug = params.slug as string;
    const userId = parseInt(req.session.user.id as string);

    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const existingFollower = await prisma.projectFollower.findUnique({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId,
        },
      },
    });

    if (existingFollower) {
      await prisma.projectFollower.delete({
        where: {
          projectId_userId: {
            projectId: project.id,
            userId,
          },
        },
      });

      return NextResponse.json({
        message: 'You have unfollowed this project',
        isFollowing: false,
      });
    }

    const body = await req.json().catch(() => ({}));
    const notificationPreferences = body.notification_preferences || {
      milestone_due: true,
      milestone_completed: true,
      status_change: true,
      new_comment: true,
      file_upload: true,
    };

    const follower = await prisma.projectFollower.create({
      data: {
        projectId: project.id,
        userId,
        notificationPreferences,
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
    });

    return NextResponse.json(
      {
        message: 'You are now following this project',
        follower,
        isFollowing: true,
      },
      { status: 201 }
    );
  }
);
