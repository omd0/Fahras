import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const programs = await prisma.program.findMany({
      include: { department: true }
    });
    return NextResponse.json(programs);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}
