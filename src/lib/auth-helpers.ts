import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    throw new AuthError("Authentication required", 401);
  }
  return session;
}

export async function requireRole(roles: string | string[]): Promise<Session> {
  const session = await requireAuth();
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  const userRoles = session.user.roles ?? [];
  const hasRole = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasRole) {
    throw new AuthError("Insufficient permissions", 403);
  }
  return session;
}

export async function optionalAuth(): Promise<Session | null> {
  const session = await auth();
  return session ?? null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
