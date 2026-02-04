import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = parseInt(req.session.user.id);

    const searches = await prisma.savedSearch.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { usageCount: 'desc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ success: true, data: searches });
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch saved searches' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = parseInt(req.session.user.id);
    const body = await req.json();
    const { name, filters, isDefault } = body;

    if (!name || !filters) {
      return NextResponse.json(
        { success: false, message: 'Name and filters are required' },
        { status: 422 }
      );
    }

    const savedSearch = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.savedSearch.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false }
        });
      }

      return tx.savedSearch.create({
        data: {
          userId,
          name,
          filters,
          isDefault: isDefault ?? false,
        }
      });
    });

    return NextResponse.json(
      { success: true, message: 'Saved search created', data: savedSearch },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating saved search:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create saved search' },
      { status: 500 }
    );
  }
});
