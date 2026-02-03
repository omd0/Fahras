import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const faculties = await prisma.faculty.findMany({
      include: {
        user: true,
        department: true
      }
    });
    return NextResponse.json(faculties);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch faculties' },
      { status: 500 }
    );
  }
}
