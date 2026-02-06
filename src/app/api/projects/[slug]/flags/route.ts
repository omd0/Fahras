import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withOptionalAuth } from '@/middleware/auth';
import type { Session } from 'next-auth';
import type { FlagType, FlagSeverity } from '@prisma/client';

export const GET = withOptionalAuth(
  async (
    req: NextRequest & { session: Session | null },
    ctx: { params: Promise<Record<string, string>> }
  ) => {
    const params = await ctx.params;
    const slug = params.slug as string;
    const searchParams = req.nextUrl.searchParams;
    const resolved = searchParams.get('resolved');
    const severity = searchParams.get('severity');
    const flagType = searchParams.get('flag_type');

    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true, isPublic: true, createdByUserId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const userId = req.session?.user?.id ? parseInt(req.session.user.id as string) : null;
    const isCreator = userId === project.createdByUserId;

    if (!project.isPublic && !isCreator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const whereClause: {
      projectId: number;
      resolvedAt?: { not: null } | null;
      severity?: FlagSeverity;
      flagType?: FlagType;
    } = {
      projectId: project.id,
      ...(resolved === 'true' && { resolvedAt: { not: null } }),
      ...(resolved === 'false' && { resolvedAt: null }),
      ...(severity && { severity: severity as FlagSeverity }),
      ...(flagType && { flagType: flagType as FlagType }),
    };

    const flags = await prisma.projectFlag.findMany({
      where: whereClause,
      include: {
        flaggedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const filtered = flags.filter((flag) => {
      if (flag.isConfidential && !isCreator && flag.flaggedByUserId !== userId) {
        return false;
      }
      return true;
    });

    return NextResponse.json({
      flags: filtered,
    });
  }
);

export const POST = withAuth(
  async (
    req: NextRequest & { session: Session },
    ctx: { params: Promise<Record<string, string>> }
  ) => {
    const params = await ctx.params;
    const slug = params.slug as string;
    const userId = parseInt(req.session.user.id as string);

    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { flag_type, severity, message, is_confidential } = body;

    if (!flag_type || !severity || !message) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: {
            flag_type: flag_type ? undefined : 'Flag type is required',
            severity: severity ? undefined : 'Severity is required',
            message: message ? undefined : 'Message is required',
          },
        },
        { status: 422 }
      );
    }

    const validFlagTypes = [
      'scope_creep',
      'technical_blocker',
      'team_conflict',
      'resource_shortage',
      'timeline_risk',
      'other',
    ];
    const validSeverities = ['low', 'medium', 'high', 'critical'];

    if (!validFlagTypes.includes(flag_type)) {
      return NextResponse.json(
        { message: 'Invalid flag type' },
        { status: 422 }
      );
    }

    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { message: 'Invalid severity' },
        { status: 422 }
      );
    }

    const flag = await prisma.projectFlag.create({
      data: {
        projectId: project.id,
        flaggedByUserId: userId,
        flagType: flag_type,
        severity,
        message,
        isConfidential: is_confidential || false,
      },
      include: {
        flaggedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Flag created successfully',
        flag,
      },
      { status: 201 }
    );
  }
);
