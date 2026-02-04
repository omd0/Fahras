import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };

/**
 * GET /api/bookmarks
 * Returns user's bookmarked projects with pagination
 * Requires authentication
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = parseInt(req.session.user.id, 10);
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
    const perPage = Math.min(parseInt(req.nextUrl.searchParams.get('per_page') || '15', 10), 100);

    const skip = (page - 1) * perPage;

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId },
        include: {
          project: {
            select: {
              id: true,
              slug: true,
              title: true,
              abstract: true,
              status: true,
              adminApprovalStatus: true,
              createdAt: true,
              creator: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                },
              },
              program: {
                select: {
                  id: true,
                  name: true,
                  department: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              projectTags: {
                include: {
                  tag: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      prisma.bookmark.count({ where: { userId } }),
    ]);

    const lastPage = Math.ceil(total / perPage);

    return NextResponse.json({
      data: bookmarks.map((b) => b.project),
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total,
      has_more_pages: page < lastPage,
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch bookmarks',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
