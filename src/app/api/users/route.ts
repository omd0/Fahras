import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    const whereClause: Record<string, unknown> = {
      status: 'active',
    };

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      whereClause.roleUsers = {
        some: {
          role: {
            name: role,
          },
        },
      };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      take: Math.min(limit, 100),
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        roleUsers: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      full_name: user.fullName,
      email: user.email,
      avatar_url: user.avatarUrl,
      roles: user.roleUsers.map((ru) => ({
        id: ru.role.id,
        name: ru.role.name,
      })),
    }));

    return NextResponse.json({
      data: formattedUsers,
      count: formattedUsers.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch users',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
