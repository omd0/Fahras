import { NextRequest, NextResponse } from 'next/server';
// import { signIn } from 'next-auth/react';

// This is a compatibility endpoint for the frontend
// Actual auth is handled by NextAuth at /api/auth/[...nextauth]
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password required' },
        { status: 400 }
      );
    }

    // The frontend should call NextAuth's signIn directly
    // This endpoint exists for API compatibility
    return NextResponse.json({
      message: 'Please use NextAuth signIn method',
      redirect: '/api/auth/signin'
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Login failed', error: String(error) },
      { status: 500 }
    );
  }
}
