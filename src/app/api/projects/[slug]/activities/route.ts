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
    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const perPage = Math.min(100, parseInt(searchParams.get('per_page') || '20'));
    const activityType = searchParams.get('activity_type') || undefined;
    const fromDate = searchParams.get('from_date')
      ? new Date(searchParams.get('from_date')!)
      : undefined;
    const toDate = searchParams.get('to_date')
      ? new Date(searchParams.get('to_date')!)
      : undefined;

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

    const whereClause = {
      projectId: project.id,
      ...(activityType && { activityType }),
      ...(fromDate && { createdAt: { gte: fromDate } }),
      ...(toDate && { createdAt: { lte: toDate } }),
    };

    const [activities, total] = await Promise.all([
      prisma.projectActivity.findMany({
        where: whereClause,
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
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.projectActivity.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: activities,
      pagination: {
        current_page: page,
        per_page: perPage,
        total,
        last_page: Math.ceil(total / perPage),
      },
    });
  }
);
