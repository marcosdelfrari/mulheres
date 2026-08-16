import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";
import { isImageNsfw } from "@/lib/nsfw";

const region = process.env.AWS_REGION ?? "us-east-2";
const bucket = process.env.AWS_S3_BUCKET ?? "";

export type UploadedImage = {
  url: string;
  isNsfw: boolean;
};

function getClient() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "Configure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY e AWS_S3_BUCKET no .env.local.",
    );
  }

  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function extensionFor(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export async function uploadImageToS3(
  file: File,
  folder: string,
  maxBytes = 2_500_000,
  options: { classifyNsfw?: boolean } = {},
): Promise<UploadedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Envie uma imagem (JPG, PNG ou WEBP).");
  }

  if (file.size > maxBytes) {
    throw new Error("Imagem muito grande. Máximo 2,5 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `${folder}/${Date.now()}-${randomBytes(6).toString("hex")}.${extensionFor(file.type)}`;
  const classifyNsfw = options.classifyNsfw ?? true;

  const [isNsfw] = await Promise.all([
    classifyNsfw ? isImageNsfw(buffer) : Promise.resolve(false),
    getClient().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    ),
  ]);

  return {
    url: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
    isNsfw,
  };
}

export async function uploadImagesToS3(files: File[], folder: string) {
  const uploaded: UploadedImage[] = [];
  for (const file of files) {
    uploaded.push(await uploadImageToS3(file, folder));
  }
  return uploaded;
}
