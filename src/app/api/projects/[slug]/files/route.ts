import { NextRequest, NextResponse } from "next/server";
import { withOptionalAuth, withAuth } from "@/middleware/auth";
import { prisma } from "@/lib/prisma";
import { uploadToS3, getExtension } from "@/lib/s3";
import type { Session } from "next-auth";

type OptionalAuthRequest = NextRequest & { session: Session | null };
type AuthenticatedRequest = NextRequest & { session: Session };
type RouteContext = { params: Promise<Record<string, string>> };

async function findProjectBySlug(slug: string) {
  const project = await prisma.project.findUnique({ where: { slug } });
  if (project) return project;

  if (/^\d+$/.test(slug)) {
    return prisma.project.findUnique({ where: { id: parseInt(slug, 10) } });
  }
  return null;
}

export const GET = withOptionalAuth(
  async (req: OptionalAuthRequest, ctx: RouteContext) => {
    try {
      const { slug } = await ctx.params;
      const project = await findProjectBySlug(slug);
      if (!project) {
        return NextResponse.json(
          { message: "Project not found" },
          { status: 404 }
        );
      }

      const files = await prisma.file.findMany({
        where: { projectId: project.id },
        include: {
          uploader: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { uploadedAt: "desc" },
      });

      const serializedFiles = files.map((f) => ({
        id: f.id,
        originalFilename: f.originalFilename,
        filename: f.filename,
        storageUrl: f.storageUrl,
        sizeBytes: f.sizeBytes.toString(),
        mimeType: f.mimeType,
        isPublic: f.isPublic,
        uploadedAt: f.uploadedAt,
        uploader: f.uploader
          ? {
              id: f.uploader.id,
              fullName: f.uploader.fullName,
              email: f.uploader.email,
            }
          : null,
      }));

      return NextResponse.json({ files: serializedFiles });
    } catch (error) {
      console.error("Error listing files:", error);
      return NextResponse.json(
        { message: "Failed to list files" },
        { status: 500 }
      );
    }
  }
);

export const POST = withAuth(
  async (req: AuthenticatedRequest, ctx: RouteContext) => {
    try {
      const { slug } = await ctx.params;
      const userId = parseInt(req.session.user.id, 10);

      const project = await findProjectBySlug(slug);
      if (!project) {
        return NextResponse.json(
          { message: "Project not found" },
          { status: 404 }
        );
      }

      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { message: "Validation failed", errors: { file: ["File is required"] } },
          { status: 422 }
        );
      }

      const isPublicRaw = formData.get("is_public");
      const isPublic =
        isPublicRaw === "1" || isPublicRaw === "true" ? true : false;

      const buffer = Buffer.from(await file.arrayBuffer());
      const extension = getExtension(file.name);

      const { s3Key, filename, sha256Hash, sizeBytes } = await uploadToS3(
        buffer,
        project.id,
        extension,
        file.type || "application/octet-stream"
      );

      const dbFile = await prisma.file.create({
        data: {
          projectId: project.id,
          uploadedByUserId: userId,
          filename,
          originalFilename: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: BigInt(sizeBytes),
          storageUrl: s3Key,
          checksum: sha256Hash,
          isPublic,
          uploadedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          message: "File uploaded successfully",
          file: {
            ...dbFile,
            sizeBytes: dbFile.sizeBytes.toString(),
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      return NextResponse.json(
        { message: "File upload failed" },
        { status: 500 }
      );
    }
  }
);
