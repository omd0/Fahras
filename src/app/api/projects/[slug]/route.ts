import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth, withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type OptionalAuthRequest = NextRequest & { session: Session | null };
type AuthenticatedRequest = NextRequest & { session: Session };
type RouteContext = { params: Promise<Record<string, string>> };

const projectIncludes = {
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
    orderBy: { uploadedAt: 'desc' as const },
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
};

async function findProjectBySlug(slug: string) {
  let project = await prisma.project.findUnique({
    where: { slug },
    include: projectIncludes,
  });

  if (!project && /^\d+$/.test(slug)) {
    project = await prisma.project.findUnique({
      where: { id: parseInt(slug, 10) },
      include: projectIncludes,
    });
  }

  return project;
}

function serializeProject(project: NonNullable<Awaited<ReturnType<typeof findProjectBySlug>>>) {
  return {
    ...project,
    files: project.files.map((f) => ({
      ...f,
      sizeBytes: f.sizeBytes.toString(),
    })),
  };
}

export const GET = withOptionalAuth(async (req: OptionalAuthRequest, ctx: RouteContext) => {
  try {
    const { slug } = await ctx.params;
    const session = req.session;
    const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;
    const userRoles = session?.user?.roles ?? [];
    const isAdmin = userRoles.includes('admin');
    const isReviewer = userRoles.includes('reviewer');

    const project = await findProjectBySlug(slug);
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    if (!userId) {
      if (project.adminApprovalStatus !== 'approved') {
        return NextResponse.json({ message: 'Project not found' }, { status: 404 });
      }
    } else if (!isAdmin && !isReviewer) {
      if (project.adminApprovalStatus !== 'approved' && project.createdByUserId !== userId) {
        return NextResponse.json({ message: 'Project not found' }, { status: 404 });
      }
    }

    let isBookmarked = false;
    if (userId) {
      const bookmark = await prisma.bookmark.findUnique({
        where: { userId_projectId: { userId, projectId: project.id } },
      });
      isBookmarked = !!bookmark;
    }

    return NextResponse.json({
      project: {
        ...serializeProject(project),
        is_bookmarked: isBookmarked,
      },
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch project',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { slug } = await ctx.params;
    const userId = parseInt(req.session.user.id, 10);
    const userRoles = req.session.user.roles ?? [];
    const isAdmin = userRoles.includes('admin');

    const project = await findProjectBySlug(slug);
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    if (project.createdByUserId !== userId && !isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized to update this project' },
        { status: 403 }
      );
    }

    const body = await req.json();

    const allowedFields = [
      'title', 'abstract', 'keywords', 'academic_year', 'academicYear',
      'semester', 'status', 'is_public', 'isPublic', 'doi', 'repo_url',
      'repoUrl', 'program_id', 'programId', 'custom_members', 'customMembers',
      'custom_advisors', 'customAdvisors',
    ];

    const validStatuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: { status: [`Status must be one of: ${validStatuses.join(', ')}`] },
        },
        { status: 422 }
      );
    }

    const validSemesters = ['fall', 'spring', 'summer'];
    if (body.semester && !validSemesters.includes(body.semester)) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: { semester: [`Semester must be one of: ${validSemesters.join(', ')}`] },
        },
        { status: 422 }
      );
    }

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        const prismaKey = key === 'academic_year' ? 'academicYear'
          : key === 'is_public' ? 'isPublic'
          : key === 'repo_url' ? 'repoUrl'
          : key === 'program_id' ? 'programId'
          : key === 'custom_members' ? 'customMembers'
          : key === 'custom_advisors' ? 'customAdvisors'
          : key;
        updateData[prismaKey] = body[key];
      }
    }

    const updatedProject = await prisma.$transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx.project.update({
          where: { id: project.id },
          data: updateData,
        });
      }

      if (body.members && Array.isArray(body.members)) {
        await tx.projectMember.deleteMany({ where: { projectId: project.id } });
        if (body.members.length > 0) {
          await tx.projectMember.createMany({
            data: body.members.map((m: { userId: number; role: string }) => ({
              projectId: project.id,
              userId: m.userId,
              roleInProject: m.role as 'LEAD' | 'MEMBER',
            })),
          });
        }
      }

      if (body.advisors && Array.isArray(body.advisors)) {
        await tx.projectAdvisor.deleteMany({ where: { projectId: project.id } });
        if (body.advisors.length > 0) {
          await tx.projectAdvisor.createMany({
            data: body.advisors.map((a: { userId: number; role: string }) => ({
              projectId: project.id,
              userId: a.userId,
              advisorRole: a.role as 'MAIN' | 'CO_ADVISOR' | 'REVIEWER',
            })),
          });
        }
      }

      if (body.tags && Array.isArray(body.tags)) {
        await tx.projectTag.deleteMany({ where: { projectId: project.id } });
        if (body.tags.length > 0) {
          await tx.projectTag.createMany({
            data: body.tags.map((tagId: number) => ({
              projectId: project.id,
              tagId,
            })),
          });
        }
      }

      return tx.project.findUnique({
        where: { id: project.id },
        include: projectIncludes,
      });
    });

    if (!updatedProject) {
      return NextResponse.json({ message: 'Failed to fetch updated project' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Project updated successfully',
      project: serializeProject(updatedProject),
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      {
        message: 'Failed to update project',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { slug } = await ctx.params;
    const userId = parseInt(req.session.user.id, 10);
    const userRoles = req.session.user.roles ?? [];
    const isAdmin = userRoles.includes('admin');

    const project = await prisma.project.findUnique({ where: { slug } });
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    if (project.createdByUserId !== userId && !isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized to delete this project' },
        { status: 403 }
      );
    }

    await prisma.project.delete({ where: { id: project.id } });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      {
        message: 'Failed to delete project',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
