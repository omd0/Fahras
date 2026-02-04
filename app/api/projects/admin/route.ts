import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import type { Prisma } from '@prisma/client';

type AuthenticatedRequest = NextRequest & { session: Session };

export const GET = withRole('admin', async (req: AuthenticatedRequest) => {
  try {
    const url = new URL(req.url);

    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const perPage = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get('per_page') || url.searchParams.get('limit') || '15', 10))
    );
    const skip = (page - 1) * perPage;

    const approvalStatus = url.searchParams.get('approval_status');
    const status = url.searchParams.get('status');
    const departmentId = url.searchParams.get('department_id');
    const programId = url.searchParams.get('program_id');
    const academicYear = url.searchParams.get('academic_year');
    const createdBy = url.searchParams.get('created_by');
    const search = url.searchParams.get('search') || '';

    const allowedSort = ['created_at', 'updated_at', 'title', 'academic_year', 'admin_approval_status', 'approved_at'] as const;
    const sortByRaw = url.searchParams.get('sort_by') || 'created_at';
    const sortBy = allowedSort.includes(sortByRaw as (typeof allowedSort)[number])
      ? sortByRaw
      : 'created_at';
    const sortOrder = url.searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc';

    const sortFieldMap: Record<string, string> = {
      created_at: 'createdAt',
      updated_at: 'updatedAt',
      title: 'title',
      academic_year: 'academicYear',
      admin_approval_status: 'adminApprovalStatus',
      approved_at: 'approvedAt',
    };
    const prismaSort = sortFieldMap[sortBy] || 'createdAt';

    const conditions: Prisma.ProjectWhereInput[] = [];

    if (approvalStatus) {
      conditions.push({ adminApprovalStatus: approvalStatus as Prisma.EnumAdminApprovalStatusFilter });
    }
    if (status) {
      conditions.push({ status: status as Prisma.EnumProjectStatusFilter });
    }
    if (programId) {
      conditions.push({ programId: parseInt(programId, 10) });
    }
    if (departmentId) {
      conditions.push({ program: { departmentId: parseInt(departmentId, 10) } });
    }
    if (academicYear) {
      conditions.push({ academicYear });
    }
    if (createdBy) {
      conditions.push({ createdByUserId: parseInt(createdBy, 10) });
    }
    if (search.trim()) {
      conditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { abstract: { contains: search, mode: 'insensitive' } },
          { keywords: { string_contains: search } },
        ],
      });
    }

    const where: Prisma.ProjectWhereInput =
      conditions.length > 0 ? { AND: conditions } : {};

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { [prismaSort]: sortOrder },
        include: {
          creator: {
            select: { id: true, fullName: true, email: true, avatarUrl: true },
          },
          approver: {
            select: { id: true, fullName: true, email: true },
          },
          program: {
            include: { department: { select: { id: true, name: true } } },
          },
          projectMembers: {
            include: { user: { select: { id: true, fullName: true, email: true } } },
          },
          projectAdvisors: {
            include: { user: { select: { id: true, fullName: true, email: true } } },
          },
          files: {
            orderBy: { uploadedAt: 'desc' },
            select: {
              id: true,
              filename: true,
              originalFilename: true,
              mimeType: true,
              sizeBytes: true,
              isPublic: true,
              uploadedAt: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    const lastPage = Math.max(1, Math.ceil(total / perPage));

    const data = projects.map((project) => ({
      ...project,
      files: project.files.map((f) => ({
        ...f,
        sizeBytes: f.sizeBytes.toString(),
      })),
    }));

    return NextResponse.json({
      projects: data,
      pagination: {
        current_page: page,
        per_page: perPage,
        total,
        last_page: lastPage,
        has_more_pages: page < lastPage,
      },
    });
  } catch (error) {
    console.error('Error fetching admin projects:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch admin projects',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
