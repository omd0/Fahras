import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };

export const GET = withRole('admin', async (req: AuthenticatedRequest) => {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        include: {
          roleUsers: {
            include: { role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    const formattedUsers = users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.roleUsers.map((ru) => ({
        id: ru.role.id,
        name: ru.role.name,
        description: ru.role.description,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      count: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});

export const POST = withRole('admin', async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();

    if (!body.fullName || !body.email || !body.roleIds || !Array.isArray(body.roleIds)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: fullName, email, roleIds (array)',
        },
        { status: 422 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: body.email.toLowerCase().trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email already exists',
        },
        { status: 422 }
      );
    }

    const roles = await prisma.role.findMany({
      where: { id: { in: body.roleIds } },
    });

    if (roles.length !== body.roleIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: 'One or more role IDs do not exist',
        },
        { status: 422 }
      );
    }

    const password = body.password || 'password';
    const hashedPassword = await bcryptjs.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          fullName: body.fullName,
          email: body.email.toLowerCase().trim(),
          password: hashedPassword,
          status: body.status || 'active',
        },
      });

      await Promise.all(
        body.roleIds.map((roleId: number) =>
          tx.roleUser.create({
            data: {
              userId: newUser.id,
              roleId,
            },
          })
        )
      );

      return newUser;
    });

    const createdUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roleUsers: {
          include: { role: true },
        },
      },
    });

    if (!createdUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch created user',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: createdUser.id,
          fullName: createdUser.fullName,
          email: createdUser.email,
          status: createdUser.status,
          emailVerifiedAt: createdUser.emailVerifiedAt,
          lastLoginAt: createdUser.lastLoginAt,
          createdAt: createdUser.createdAt,
          updatedAt: createdUser.updatedAt,
          roles: createdUser.roleUsers.map((ru) => ({
            id: ru.role.id,
            name: ru.role.name,
            description: ru.role.description,
          })),
        },
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create user',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
