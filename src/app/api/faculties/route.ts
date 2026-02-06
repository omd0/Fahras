import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const faculties = await prisma.faculty.findMany({
      include: {
        user: true,
        department: true
      }
    });
    return NextResponse.json(faculties);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch faculties' },
      { status: 500 }
    );
  }
}
