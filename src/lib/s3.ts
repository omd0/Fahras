import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID, createHash } from "crypto";

const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.AWS_ENDPOINT || undefined,
  forcePathStyle: process.env.AWS_USE_PATH_STYLE_ENDPOINT === "true",
});

const BUCKET = process.env.AWS_BUCKET || "fahras-files";

export interface UploadResult {
  s3Key: string;
  filename: string;
  sha256Hash: string;
  sizeBytes: number;
}

export async function uploadToS3(
  buffer: Buffer,
  projectId: number,
  originalExtension: string,
  contentType: string
): Promise<UploadResult> {
  const uuid = randomUUID();
  const ext = originalExtension ? `.${originalExtension}` : "";
  const filename = `${uuid}${ext}`;
  const s3Key = `uploads/projects/${projectId}/${filename}`;
  const hash = createHash("sha256").update(buffer).digest("hex");

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return { s3Key, filename, sha256Hash: hash, sizeBytes: buffer.length };
}

export interface DownloadStream {
  body: ReadableStream;
  contentLength?: number;
  contentType?: string;
}

export async function downloadFromS3(s3Key: string): Promise<DownloadStream> {
  const response = await s3Client.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: s3Key })
  );

  if (!response.Body) {
    throw new Error("S3 response body is empty");
  }

  return {
    body: response.Body as unknown as ReadableStream,
    contentLength: response.ContentLength,
    contentType: response.ContentType ?? undefined,
  };
}

export async function deleteFromS3(s3Key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: s3Key })
  );
}

export async function getPresignedUrl(
  s3Key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: s3Key });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

export function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1 || lastDot === filename.length - 1) return "";
  return filename.slice(lastDot + 1).toLowerCase();
}

/** RFC 5987 Content-Disposition encoding for Arabic/UTF-8 filenames. */
export function rfc5987ContentDisposition(originalFilename: string): string {
  const encoded = encodeURIComponent(originalFilename);
  return `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`;
}
