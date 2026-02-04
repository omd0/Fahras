import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { Session } from 'next-auth';

type OptionalAuthRequest = NextRequest & { session: Session | null };

function buildVisibilityFilter(session: Session | null): Prisma.ProjectWhereInput {
  const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;
  const roles = session?.user?.roles ?? [];

  if (!userId) {
    return { adminApprovalStatus: 'approved' };
  }
  if (roles.includes('admin') || roles.includes('reviewer')) {
    return {};
  }
  return {
    OR: [
      { adminApprovalStatus: 'approved' },
      { createdByUserId: userId },
      { projectMembers: { some: { userId } } },
      { projectAdvisors: { some: { userId } } },
    ],
  };
}

export const GET = withOptionalAuth(async (req: OptionalAuthRequest) => {
  try {
    const visibility = buildVisibilityFilter(req.session);
    const isGuestOrRegular = !!visibility.adminApprovalStatus;

    const approvalClause = isGuestOrRegular
      ? Prisma.sql`WHERE p.admin_approval_status = 'approved'`
      : Prisma.empty;

    const monthlyApprovalClause = isGuestOrRegular
      ? Prisma.sql`AND admin_approval_status = 'approved'`
      : Prisma.empty;

    const [
      totalProjects,
      statusGroups,
      yearGroups,
      departmentGroups,
      recentActivity,
      monthlyTrend,
    ] = await Promise.all([
      prisma.project.count({ where: visibility }),

      prisma.project.groupBy({
        by: ['status'],
        where: visibility,
        _count: { id: true },
      }),

      prisma.project.groupBy({
        by: ['academicYear'],
        where: visibility,
        _count: { id: true },
        orderBy: { academicYear: 'desc' },
      }),

      prisma.$queryRaw<Array<{ department: string; count: bigint }>>`
        SELECT d.name AS department, COUNT(p.id)::bigint AS count
        FROM projects p
        JOIN programs pr ON p.program_id = pr.id
        JOIN departments d ON pr.department_id = d.id
        ${approvalClause}
        GROUP BY d.id, d.name
        ORDER BY count DESC
      `,

      prisma.project.count({
        where: {
          ...visibility,
          updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),

      prisma.$queryRaw<Array<{ month: Date; count: bigint }>>`
        SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*)::bigint AS count
        FROM projects
        WHERE created_at >= NOW() - INTERVAL '12 months'
        ${monthlyApprovalClause}
        GROUP BY month
        ORDER BY month ASC
      `,
    ]);

    const statusDistribution: Record<string, number> = {};
    for (const g of statusGroups) {
      statusDistribution[g.status] = g._count.id;
    }

    const yearDistribution = yearGroups.map((g) => ({
      academic_year: g.academicYear,
      count: g._count.id,
    }));

    const departmentDistribution = departmentGroups.map((g) => ({
      department: g.department,
      count: Number(g.count),
    }));

    const monthlyTrendFormatted = monthlyTrend.map((g) => ({
      month: g.month,
      count: Number(g.count),
    }));

    return NextResponse.json({
      status_distribution: statusDistribution,
      year_distribution: yearDistribution,
      department_distribution: departmentDistribution,
      recent_activity: recentActivity,
      monthly_trend: monthlyTrendFormatted,
      total_projects: totalProjects,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch project analytics',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
