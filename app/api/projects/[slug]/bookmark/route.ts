import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type RouteContext = { params: Promise<Record<string, string>> };
type AuthenticatedRequest = NextRequest & { session: Session };

/**
 * POST /api/projects/[slug]/bookmark
 * Toggle bookmark (create if not exists, delete if exists)
 * Requires authentication
 */
export const POST = withAuth(async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { slug } = await ctx.params;
    const userId = parseInt(req.session.user.id, 10);

    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: project.id,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({
        message: 'Bookmark removed',
        data: { bookmarked: false },
      });
    } else {
      await prisma.bookmark.create({
        data: {
          userId,
          projectId: project.id,
        },
      });

      return NextResponse.json(
        {
          message: 'Bookmark added',
          data: { bookmarked: true },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json(
      {
        message: 'Failed to toggle bookmark',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
