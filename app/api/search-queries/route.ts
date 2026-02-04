import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { optionalAuth } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const session = await optionalAuth();
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

    const body = await request.json();
    const { query, normalized_query, filters, results_count, had_results } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { message: 'Search query is required' },
        { status: 400 }
      );
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || null;

    const searchQuery = await prisma.searchQuery.create({
      data: {
        userId,
        originalQuery: query,
        normalizedQuery: normalized_query || null,
        extractedFilters: filters || null,
        resultsCount: typeof results_count === 'number' ? results_count : 0,
        hadResults: typeof had_results === 'boolean' ? had_results : true,
        ipAddress: ip,
      },
    });

    return NextResponse.json(
      { message: 'Search query logged', id: searchQuery.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error logging search query:', error);
    return NextResponse.json(
      { message: 'Failed to log search query' },
      { status: 500 }
    );
  }
}
