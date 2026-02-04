import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

type AuthenticatedRequest = NextRequest & { session: Session };

/**
 * GET /api/milestone-templates
 * Returns all milestone templates with optional filtering
 * Query params: program_id, department_id, is_default
 * Requires admin role
 */
export const GET = withRole('admin', async (req: AuthenticatedRequest) => {
  try {
    const programId = req.nextUrl.searchParams.get('program_id');
    const departmentId = req.nextUrl.searchParams.get('department_id');
    const isDefault = req.nextUrl.searchParams.get('is_default');

    const where: Record<string, unknown> = {};

    // Filter by program: include templates for this program OR templates available for all (program_id is null)
    if (programId) {
      where.OR = [
        { programId: parseInt(programId, 10) },
        { programId: null },
      ];
    }

    // Filter by department: include templates for this department OR templates available for all (department_id is null)
    if (departmentId) {
      if (where.OR) {
        where.AND = [
          {
            OR: [
              { departmentId: parseInt(departmentId, 10) },
              { departmentId: null },
            ],
          },
        ];
      } else {
        where.OR = [
          { departmentId: parseInt(departmentId, 10) },
          { departmentId: null },
        ];
      }
    }

    // Filter by default
    if (isDefault !== null) {
      where.isDefault = isDefault === 'true';
    }

    const templates = await prisma.milestoneTemplate.findMany({
      where,
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
        program: true,
        department: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      data: templates,
    });
  } catch (error) {
    console.error('Error fetching milestone templates:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch milestone templates',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/milestone-templates
 * Creates a new milestone template with items
 * Requires admin role
 */
export const POST = withRole('admin', async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { name, description, programId, departmentId, isDefault, items } = body;

    // Validate required fields
    if (!name || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: {
            name: !name ? 'Name is required' : undefined,
            items: !Array.isArray(items) || items.length === 0 ? 'At least one item is required' : undefined,
          },
        },
        { status: 422 }
      );
    }

    // If setting as default, unset other defaults in same scope
    if (isDefault) {
      const where: Record<string, unknown> = { isDefault: true };
      if (programId) {
        where.programId = programId;
      } else {
        where.programId = null;
      }
      if (departmentId) {
        where.departmentId = departmentId;
      } else {
        where.departmentId = null;
      }

      await prisma.milestoneTemplate.updateMany({
        where,
        data: { isDefault: false },
      });
    }

    // Create template with items in a transaction
    const userId = parseInt(req.session.user.id, 10);
    const template = await prisma.milestoneTemplate.create({
      data: {
        name,
        description: description || null,
        programId: programId || null,
        departmentId: departmentId || null,
        isDefault: isDefault || false,
        createdByUserId: userId,
        items: {
          create: items.map((item: Record<string, unknown>, index: number) => ({
            title: String(item.title),
            description: item.description ? String(item.description) : null,
            estimatedDays: Number(item.estimated_days || item.estimatedDays || 0),
            order: item.order !== undefined ? Number(item.order) : index,
          })),
        },
      },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
        program: true,
        department: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Milestone template created successfully',
        data: template,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating milestone template:', error);
    return NextResponse.json(
      {
        message: 'Failed to create milestone template',
        ...(process.env.NODE_ENV === 'development' && { error: String(error) }),
      },
      { status: 500 }
    );
  }
});
