import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };
type RouteContext = { params: Promise<Record<string, string>> };

export const POST = withRole('admin', async (req: AuthenticatedRequest, ctx: RouteContext) => {
  try {
    const { slug } = await ctx.params;
    const adminId = parseInt(req.session.user.id, 10);

    const project = await prisma.project.findUnique({ where: { slug } });
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));

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

    const updateData: Record<string, unknown> = {
      adminApprovalStatus: 'approved',
      approvedByUserId: adminId,
      approvedAt: new Date(),
      adminNotes: body.admin_notes ?? body.adminNotes ?? null,
    };

    if (body.status) {
      updateData.status = body.status;
    }

    await prisma.project.update({
      where: { id: project.id },
      data: updateData,
    });

    await prisma.file.updateMany({
      where: { projectId: project.id },
      data: { isPublic: true },
    });

    const updated = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        creator: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
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
        projectTags: { include: { tag: true } },
      },
    });

    return NextResponse.json({
      message: 'Project approved successfully',
      project: updated,
    });
  } catch (error) {
    console.error('Error approving project:', error);
    return NextResponse.json(
      {
        message: 'Failed to approve project',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
