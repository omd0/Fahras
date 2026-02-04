import { NextRequest, NextResponse } from "next/server";
import { withOptionalAuth } from "@/middleware/auth";
import { prisma } from "@/lib/prisma";
import { downloadFromS3, rfc5987ContentDisposition } from "@/lib/s3";
import type { Session } from "next-auth";

type OptionalAuthRequest = NextRequest & { session: Session | null };
type RouteContext = { params: Promise<Record<string, string>> };

export const GET = withOptionalAuth(
  async (req: OptionalAuthRequest, ctx: RouteContext) => {
    try {
      const { id } = await ctx.params;
      const fileId = parseInt(id, 10);
      if (isNaN(fileId)) {
        return NextResponse.json(
          { message: "Invalid file ID" },
          { status: 400 }
        );
      }

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

      const { body, contentLength } = await downloadFromS3(file.storageUrl);

      const headers = new Headers({
        "Content-Type": file.mimeType,
        "Content-Disposition": rfc5987ContentDisposition(
          file.originalFilename
        ),
        "Cache-Control": "no-cache, must-revalidate",
      });

      if (contentLength != null) {
        headers.set("Content-Length", contentLength.toString());
      }

      return new NextResponse(body, { headers });
    } catch (error) {
      console.error("Error downloading file:", error);
      return NextResponse.json(
        { message: "File download failed" },
        { status: 500 }
      );
    }
  }
);
