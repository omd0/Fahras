import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromS3 } from "@/lib/s3";
import type { Session } from "next-auth";

type AuthenticatedRequest = NextRequest & { session: Session };
type RouteContext = { params: Promise<Record<string, string>> };

export const DELETE = withAuth(
  async (req: AuthenticatedRequest, ctx: RouteContext) => {
    try {
      const { id } = await ctx.params;
      const fileId = parseInt(id, 10);
      if (isNaN(fileId)) {
        return NextResponse.json(
          { message: "Invalid file ID" },
          { status: 400 }
        );
      }

      const userId = parseInt(req.session.user.id, 10);
      const userRoles = req.session.user.roles ?? [];
      const isAdmin = userRoles.includes("admin");

      const file = await prisma.file.findUnique({
        where: { id: fileId },
        include: { project: true },
      });

      if (!file) {
        return NextResponse.json(
          { message: "File not found" },
          { status: 404 }
        );
      }

      if (
        file.project.createdByUserId !== userId &&
        file.uploadedByUserId !== userId &&
        !isAdmin
      ) {
        return NextResponse.json(
          { message: "Unauthorized to delete this file" },
          { status: 403 }
        );
      }

      try {
        await deleteFromS3(file.storageUrl);
      } catch {
        console.error(
          `S3 delete failed for key ${file.storageUrl}, proceeding with DB cleanup`
        );
      }

      await prisma.file.delete({ where: { id: fileId } });

      return NextResponse.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      return NextResponse.json(
        { message: "Failed to delete file" },
        { status: 500 }
      );
    }
  }
);
