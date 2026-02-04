import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth, withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type RouteContext = { params: Promise<Record<string, string>> };
type OptionalAuthRequest = NextRequest & { session: Session | null };
type AuthenticatedRequest = NextRequest & { session: Session };

/**
 * GET /api/projects/[slug]/ratings
 * Returns average rating and user's own rating (if authenticated)
 * Supports optional authentication
 */
export const GET = withOptionalAuth(async (req: OptionalAuthRequest, ctx: RouteContext) => {
  try {
    const { slug } = await ctx.params;

    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const ratings = await prisma.rating.findMany({
      where: { projectId: project.id },
      select: { rating: true, userId: true },
    });

    const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

    let userRating = null;
    if (req.session?.user) {
      const userId = parseInt(req.session.user.id, 10);
      const userRatingRecord = await prisma.rating.findUnique({
        where: {
          projectId_userId: {
            projectId: project.id,
            userId,
          },
        },
        select: {
          id: true,
          rating: true,
          review: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });

      userRating = userRatingRecord;
    }

    return NextResponse.json({
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: ratings.length,
        userRating,
      },
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch ratings',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/projects/[slug]/ratings
 * Create or update rating (one per user)
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

    const body = await req.json().catch(() => ({}));

    if (!body.rating || typeof body.rating !== 'number') {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: { rating: ['Rating is required and must be a number'] },
        },
        { status: 422 }
      );
    }

    const rating = Math.max(1, Math.min(5, Math.round(body.rating)));

    const upsertedRating = await prisma.rating.upsert({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId,
        },
      },
      update: {
        rating,
        review: body.review ?? null,
      },
      create: {
        projectId: project.id,
        userId,
        rating,
        review: body.review ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Rating saved successfully',
        data: upsertedRating,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving rating:', error);
    return NextResponse.json(
      {
        message: 'Failed to save rating',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
