import crypto from "crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { AuthError } from "@/lib/auth-helpers";

/**
 * Standard Prisma include for fetching a user with roles and permissions.
 * Used across all auth API routes for consistent user response shapes.
 */
export const userWithRolesInclude = {
  roleUsers: {
    include: {
      role: {
        include: {
          permissionRoles: {
            include: { permission: true },
          },
        },
      },
    },
  },
} satisfies Prisma.UserInclude;

type UserWithRoles = Prisma.UserGetPayload<{
  include: typeof userWithRolesInclude;
}>;

/**
 * Formats a Prisma user (with roles included) into the standard API response shape.
 * Returns camelCase keys matching the Next.js frontend conventions.
 */
export function formatUserResponse(user: UserWithRoles) {
  const roles = user.roleUsers.map((ru) => ({
    id: ru.role.id,
    name: ru.role.name,
    description: ru.role.description,
    is_system_role: ru.role.isSystemRole,
    is_template: ru.role.isTemplate,
  }));

  const permissions = [
    ...new Set(
      user.roleUsers.flatMap((ru) =>
        ru.role.permissionRoles.map(
          (pr) => `${pr.permission.code}:${pr.scope}`
        )
      )
    ),
  ];

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    emailVerifiedAt: user.emailVerifiedAt,
    avatarUrl: user.avatarUrl,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    roles,
    permissions,
  };
}

/** Generate a 64-character hex token using crypto.randomBytes(32). */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/** Generate a 6-digit OTP code. */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Standard error handler for API routes.
 * Converts AuthError to proper HTTP responses; logs unexpected errors.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode }
    );
  }
  console.error("API Error:", error);
  return NextResponse.json(
    { message: "Internal server error" },
    { status: 500 }
  );
}
