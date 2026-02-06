import NextAuth from "next-auth";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

interface AuthRole {
  id: number;
  name: string;
  permissions: Array<{
    id: number;
    code: string;
    category: string | null;
    scope: string;
  }>;
}

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    status: string;
    authRoles: AuthRole[];
  }

  interface Session {
    user: {
      id: string;
      email: string;
      fullName: string;
      avatarUrl?: string | null;
      status: string;
      roles: string[];
      permissions: string[];
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    status: string;
    roles: string[];
    permissions: string[];
  }
}

export const authConfig: NextAuthConfig = {
  secret:
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV === "development"
      ? "og2PjoDory5Jj7YlnP7UgJsh6z9QlZE2FYwUIBOjwiA="
      : undefined),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        const user = await prisma.user.findFirst({
          where: {
            email: { equals: email, mode: "insensitive" },
          },
          include: {
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
          },
        });

        if (!user) return null;

        // SECURITY: bcryptjs handles Laravel's $2y$ bcrypt prefix transparently
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        if (user.status !== "active") return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        const authRoles: AuthRole[] = user.roleUsers.map((ru) => ({
          id: ru.role.id,
          name: ru.role.name,
          permissions: ru.role.permissionRoles.map((pr) => ({
            id: pr.permission.id,
            code: pr.permission.code,
            category: pr.permission.category,
            scope: pr.scope,
          })),
        }));

        return {
          id: String(user.id),
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          status: user.status,
          authRoles,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.email = user.email!;
        token.fullName = user.fullName;
        token.avatarUrl = user.avatarUrl;
        token.status = user.status;
        token.roles = user.authRoles.map((r) => r.name);
        token.permissions = [
          ...new Set(
            user.authRoles.flatMap((r) =>
              r.permissions.map((p) => `${p.code}:${p.scope}`)
            )
          ),
        ];
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        email: token.email ?? "",
        fullName: token.fullName,
        avatarUrl: token.avatarUrl,
        status: token.status,
        roles: token.roles,
        permissions: token.permissions,
      };
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
