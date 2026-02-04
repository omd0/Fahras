import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth, withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import type { Prisma } from '@prisma/client';

type OptionalAuthRequest = NextRequest & { session: Session | null };
type AuthenticatedRequest = NextRequest & { session: Session };

// ---------------------------------------------------------------------------
// Slug generation helpers
// ---------------------------------------------------------------------------
function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 6; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

async function generateUniqueSlug(
  tx?: Prisma.TransactionClient
): Promise<string> {
  const client = tx ?? prisma;
  let attempts = 0;
  while (attempts < 10) {
    const slug = generateSlug();
    const existing = await client.project.findUnique({ where: { slug } });
    if (!existing) return slug;
    attempts++;
  }
  throw new Error('Failed to generate unique slug after 10 attempts');
}

/**
 * GET /api/projects — Paginated project list with search & filters.
 *
 * Query params: search|q, status, department_id, program_id, academic_year,
 * semester, created_by, my_projects, approval_status, is_public, tag,
 * sort_by (created_at|updated_at|title|academic_year|status), sort_order (asc|desc),
 * page, per_page|limit (max 100).
 */
export const GET = withOptionalAuth(async (req: OptionalAuthRequest) => {
  try {
    const url = new URL(req.url);
    const session = req.session;
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;
    const userRoles = session?.user?.roles ?? [];
    const isAdmin = userRoles.includes('admin');
    const isReviewer = userRoles.includes('reviewer');

    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const perPage = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get('per_page') || url.searchParams.get('limit') || '15', 10))
    );
    const skip = (page - 1) * perPage;

    const allowedSort = ['created_at', 'updated_at', 'title', 'academic_year', 'status'] as const;
    type SortField = (typeof allowedSort)[number];
    const sortByRaw = url.searchParams.get('sort_by') || 'created_at';
    const sortBy: SortField = allowedSort.includes(sortByRaw as SortField)
      ? (sortByRaw as SortField)
      : 'created_at';
    const sortOrder = url.searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc';

    const sortFieldMap: Record<string, string> = {
      created_at: 'createdAt',
      updated_at: 'updatedAt',
      title: 'title',
      academic_year: 'academicYear',
      status: 'status',
    };
    const prismaSort = sortFieldMap[sortBy] || 'createdAt';

    const search = url.searchParams.get('search') || url.searchParams.get('q') || '';
    const status = url.searchParams.get('status');
    const departmentId = url.searchParams.get('department_id') || url.searchParams.get('departmentId');
    const programId = url.searchParams.get('program_id') || url.searchParams.get('programId');
    const academicYear = url.searchParams.get('academic_year') || url.searchParams.get('academicYear');
    const semester = url.searchParams.get('semester');
    const createdBy = url.searchParams.get('created_by') || url.searchParams.get('createdBy');
    const myProjects = url.searchParams.get('my_projects') === 'true';
    const approvalStatus = url.searchParams.get('approval_status') || url.searchParams.get('adminApprovalStatus');
    const isPublic = url.searchParams.get('is_public');
    const tagFilter = url.searchParams.get('tag');

    const conditions: Prisma.ProjectWhereInput[] = [];

    if (myProjects) {
      if (!userId) {
        return NextResponse.json({
          data: [],
          current_page: page,
          last_page: 1,
          per_page: perPage,
          total: 0,
          has_more_pages: false,
          search_metadata: {
            total_results: 0,
            current_page: page,
            per_page: perPage,
            last_page: 1,
            has_more_pages: false,
          },
        });
      }
      conditions.push({
        OR: [
          { createdByUserId: userId },
          { projectMembers: { some: { userId } } },
        ],
      });
    } else if (!userId) {
      conditions.push({ adminApprovalStatus: 'approved' });
    } else if (isAdmin || isReviewer) {
      // Full visibility — no filter
    } else {
      conditions.push({
        OR: [
          { adminApprovalStatus: 'approved' },
          { createdByUserId: userId },
        ],
      });
    }

    if (status) {
      conditions.push({ status: status as Prisma.EnumProjectStatusFilter });
    }

    if (programId) {
      conditions.push({ programId: parseInt(programId, 10) });
    }

    if (departmentId) {
      conditions.push({
        program: { departmentId: parseInt(departmentId, 10) },
      });
    }

    if (academicYear) {
      conditions.push({ academicYear });
    }

    if (semester) {
      conditions.push({ semester: semester as Prisma.EnumSemesterFilter });
    }

    if (createdBy) {
      conditions.push({ createdByUserId: parseInt(createdBy, 10) });
    }

    if (approvalStatus) {
      conditions.push({ adminApprovalStatus: approvalStatus as Prisma.EnumAdminApprovalStatusFilter });
    }

    if (isPublic !== null && isPublic !== undefined && isPublic !== '') {
      conditions.push({ isPublic: isPublic === 'true' });
    }

    if (tagFilter) {
      conditions.push({
        projectTags: {
          some: {
            tag: { name: { equals: tagFilter, mode: 'insensitive' } },
          },
        },
      });
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
          program: {
            include: {
              department: { select: { id: true, name: true } },
            },
          },
          projectMembers: {
            include: {
              user: { select: { id: true, fullName: true, email: true } },
            },
          },
          projectAdvisors: {
            include: {
              user: { select: { id: true, fullName: true, email: true } },
            },
          },
          projectTags: {
            include: { tag: true },
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

    let bookmarkedIds: number[] = [];
    if (userId && projects.length > 0) {
      const projectIds = projects.map((p) => p.id);
      const bookmarks = await prisma.bookmark.findMany({
        where: { userId, projectId: { in: projectIds } },
        select: { projectId: true },
      });
      bookmarkedIds = bookmarks.map((b) => b.projectId);
    }

    const data = projects.map((project) => ({
      ...project,
      files: project.files.map((f) => ({
        ...f,
        sizeBytes: f.sizeBytes.toString(), // BigInt → string for JSON serialization
      })),
      is_bookmarked: bookmarkedIds.includes(project.id),
    }));

    return NextResponse.json({
      data,
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total,
      has_more_pages: page < lastPage,
      search_metadata: {
        total_results: total,
        current_page: page,
        per_page: perPage,
        last_page: lastPage,
        has_more_pages: page < lastPage,
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch projects',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const userId = parseInt(req.session.user.id, 10);

    const errors: Record<string, string[]> = {};
    if (!body.title || typeof body.title !== 'string') {
      errors.title = ['Title is required'];
    }
    if (!body.abstract || typeof body.abstract !== 'string') {
      errors.abstract = ['Abstract is required'];
    }
    if (!body.program_id && !body.programId) {
      errors.program_id = ['Program ID is required'];
    }
    if (!body.academic_year && !body.academicYear) {
      errors.academic_year = ['Academic year is required'];
    }
    if (!body.semester) {
      errors.semester = ['Semester is required'];
    } else if (!['fall', 'spring', 'summer'].includes(body.semester)) {
      errors.semester = ['Semester must be fall, spring, or summer'];
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { message: 'Validation failed', errors },
        { status: 422 }
      );
    }

    const programId = body.program_id ?? body.programId;
    const academicYear = body.academic_year ?? body.academicYear;
    const members: Array<{ userId: number; role: 'LEAD' | 'MEMBER' }> = body.members ?? [];
    const advisors: Array<{ userId: number; role: 'MAIN' | 'CO_ADVISOR' | 'REVIEWER' }> = body.advisors ?? [];
    const tagIds: number[] = body.tags ?? body.tagIds ?? [];

    const programExists = await prisma.program.findUnique({
      where: { id: parseInt(String(programId), 10) },
    });
    if (!programExists) {
      return NextResponse.json(
        { message: 'Validation failed', errors: { program_id: ['Program not found'] } },
        { status: 422 }
      );
    }

    const project = await prisma.$transaction(async (tx) => {
      const slug = await generateUniqueSlug(tx);

      const proj = await tx.project.create({
        data: {
          slug,
          title: body.title.trim(),
          abstract: body.abstract.trim(),
          keywords: body.keywords ?? [],
          academicYear,
          semester: body.semester as 'fall' | 'spring' | 'summer',
          status: 'draft',
          isPublic: body.is_public ?? body.isPublic ?? false,
          createdByUserId: userId,
          programId: parseInt(String(programId), 10),
          customMembers: body.custom_members ?? body.customMembers ?? undefined,
          customAdvisors: body.custom_advisors ?? body.customAdvisors ?? undefined,
          doi: body.doi ?? undefined,
          repoUrl: body.repo_url ?? body.repoUrl ?? undefined,
        },
      });

      if (members.length > 0) {
        await tx.projectMember.createMany({
          data: members.map((m) => ({
            projectId: proj.id,
            userId: m.userId,
            roleInProject: m.role,
          })),
        });
      }

      if (advisors.length > 0) {
        await tx.projectAdvisor.createMany({
          data: advisors.map((a) => ({
            projectId: proj.id,
            userId: a.userId,
            advisorRole: a.role,
          })),
        });
      }

      if (tagIds.length > 0) {
        await tx.projectTag.createMany({
          data: tagIds.map((tagId) => ({
            projectId: proj.id,
            tagId,
          })),
        });
      }

      return proj;
    });

    const created = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        creator: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        program: {
          include: {
            department: { select: { id: true, name: true } },
          },
        },
        projectMembers: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
        projectAdvisors: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
        projectTags: {
          include: { tag: true },
        },
      },
    });

    return NextResponse.json(
      { message: 'Project created successfully', project: created },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      {
        message: 'Failed to create project',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
