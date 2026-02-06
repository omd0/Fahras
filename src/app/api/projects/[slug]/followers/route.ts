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

    const followers = await prisma.projectFollower.findMany({
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
    });

    return NextResponse.json({
      followers,
    });
  }
);
