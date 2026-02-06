import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth, withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type RouteContext = { params: Promise<Record<string, string>> };
type OptionalAuthRequest = NextRequest & { session: Session | null };
type AuthenticatedRequest = NextRequest & { session: Session };

/**
 * GET /api/projects/[slug]/comments
 * Returns threaded comments (top-level only with nested replies)
 * Supports optional authentication (guests can view)
 */
export const GET = withOptionalAuth(async (req: OptionalAuthRequest, ctx: RouteContext) => {
  try {
    const { slug } = await ctx.params;

    // Find project by slug
    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Get top-level comments with replies
    const comments = await prisma.comment.findMany({
      where: {
        projectId: project.id,
        parentId: null, // Only top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      data: comments,
      total: comments.length,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch comments',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/projects/[slug]/comments
 * Create a new comment or reply
 * Requires authentication
 */
export const POST = withAuth(async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { slug } = await ctx.params;
    const userId = parseInt(req.session.user.id, 10);

    // Find project by slug
    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));

    // Validate content
    if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: { content: ['Content is required and must be non-empty'] },
        },
        { status: 422 }
      );
    }

    // If parentId is provided, validate it exists and belongs to same project
    let parentId: number | null = null;
    if (body.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parseInt(body.parentId, 10) },
        select: { projectId: true },
      });

      if (!parentComment || parentComment.projectId !== project.id) {
        return NextResponse.json(
          {
            message: 'Validation failed',
            errors: { parentId: ['Parent comment not found or belongs to different project'] },
          },
          { status: 422 }
        );
      }

      parentId = parseInt(body.parentId, 10);
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: body.content.trim(),
        projectId: project.id,
        userId,
        parentId,
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
        message: 'Comment created successfully',
        data: comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      {
        message: 'Failed to create comment',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
