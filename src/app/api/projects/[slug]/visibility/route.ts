import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };
type RouteContext = { params: Promise<Record<string, string>> };

export const PUT = withAuth(async (req: AuthenticatedRequest, ctx: RouteContext) => {
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
        { message: 'Unauthorized to update project visibility' },
        { status: 403 }
      );
    }

    const body = await req.json();

    const updateData: Record<string, unknown> = {};

    if (typeof body.is_public === 'boolean' || typeof body.isPublic === 'boolean') {
      updateData.isPublic = body.is_public ?? body.isPublic;
    }

    if (body.admin_approval_status || body.adminApprovalStatus) {
      if (!isAdmin) {
        return NextResponse.json(
          { message: 'Only admins can change approval status' },
          { status: 403 }
        );
      }
      const newStatus = body.admin_approval_status ?? body.adminApprovalStatus;
      const validStatuses = ['pending', 'approved', 'hidden'];
      if (!validStatuses.includes(newStatus)) {
        return NextResponse.json(
          {
            message: 'Validation failed',
            errors: { admin_approval_status: [`Must be one of: ${validStatuses.join(', ')}`] },
          },
          { status: 422 }
        );
      }
      updateData.adminApprovalStatus = newStatus;
      updateData.approvedByUserId = userId;
      updateData.approvedAt = new Date();
    }

    if (body.admin_notes !== undefined || body.adminNotes !== undefined) {
      if (!isAdmin) {
        return NextResponse.json(
          { message: 'Only admins can set admin notes' },
          { status: 403 }
        );
      }
      updateData.adminNotes = body.admin_notes ?? body.adminNotes;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: 'Validation failed', errors: { _: ['No valid fields provided'] } },
        { status: 422 }
      );
    }

    await prisma.project.update({
      where: { id: project.id },
      data: updateData,
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
      message: 'Project visibility updated successfully',
      project: updated,
    });
  } catch (error) {
    console.error('Error updating project visibility:', error);
    return NextResponse.json(
      {
        message: 'Failed to update project visibility',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
