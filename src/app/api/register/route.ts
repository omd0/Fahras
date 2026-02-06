import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 422 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        fullName: full_name,
        status: 'active'
      }
    });

    const domain = normalizedEmail.split('@')[1];
    let roleName = 'student';
    
    if (domain === 'cti.edu.sa' || domain?.endsWith('.edu')) {
      const emailLocal = normalizedEmail.split('@')[0];
      if (emailLocal.includes('admin')) {
        roleName = 'admin';
      } else if (emailLocal.includes('student')) {
        roleName = 'student';
      } else {
        roleName = 'faculty';
      }
    }

    const role = await prisma.role.findFirst({ where: { name: roleName } });
    if (role) {
      await prisma.roleUser.create({
        data: {
          userId: user.id,
          roleId: role.id
        }
      });
    }

    const userWithRoles = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roleUsers: {
          include: {
            role: {
              include: {
                permissionRoles: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: userWithRoles!.id,
        email: userWithRoles!.email,
        fullName: userWithRoles!.fullName,
        roles: userWithRoles!.roleUsers.map(ru => ru.role)
      },
      token: 'use-nextauth-signin'
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed', error: String(error) },
      { status: 500 }
    );
  }
}
