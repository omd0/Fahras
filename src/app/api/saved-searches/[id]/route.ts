import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };
type RouteContext = { params: Promise<Record<string, string>> };

export const GET = withAuth(async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const userId = parseInt(req.session.user.id);
    const { id } = await ctx.params;
    const searchId = parseInt(id);

    const search = await prisma.savedSearch.findUnique({
      where: { id: searchId }
    });

    if (!search) {
      return NextResponse.json(
        { success: false, message: 'Saved search not found' },
        { status: 404 }
      );
    }

    if (search.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: search });
  } catch (error) {
    console.error('Error fetching saved search:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch saved search' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const userId = parseInt(req.session.user.id);
    const { id } = await ctx.params;
    const searchId = parseInt(id);
    const body = await req.json();

    const existing = await prisma.savedSearch.findUnique({
      where: { id: searchId }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Saved search not found' },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const search = await prisma.$transaction(async (tx) => {
      if (body.isDefault && !existing.isDefault) {
        await tx.savedSearch.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false }
        });
      }

      return tx.savedSearch.update({
        where: { id: searchId },
        data: {
          name: body.name ?? existing.name,
          filters: body.filters ?? existing.filters,
          isDefault: body.isDefault ?? existing.isDefault,
        }
      });
    });

    return NextResponse.json({ success: true, data: search });
  } catch (error) {
    console.error('Error updating saved search:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update saved search' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const userId = parseInt(req.session.user.id);
    const { id } = await ctx.params;
    const searchId = parseInt(id);

    const existing = await prisma.savedSearch.findUnique({
      where: { id: searchId }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Saved search not found' },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.savedSearch.delete({ where: { id: searchId } });

    return NextResponse.json({ success: true, message: 'Saved search deleted' });
  } catch (error) {
    console.error('Error deleting saved search:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete saved search' },
      { status: 500 }
    );
  }
});
