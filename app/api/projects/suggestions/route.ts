import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';

    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await prisma.project.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { abstract: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        academicYear: true,
        semester: true,
      },
      take: 10,
    });

    return NextResponse.json({
      suggestions: suggestions.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        academic_year: p.academicYear,
        semester: p.semester,
      })),
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
