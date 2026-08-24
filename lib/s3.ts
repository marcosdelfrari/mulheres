import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from "crypto";

const region = process.env.AWS_REGION ?? "us-east-2";
const bucket = process.env.AWS_S3_BUCKET ?? "";

export const MAX_PHOTO_BYTES = 2_500_000;
export const MAX_LISTING_PHOTOS = 5;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type UploadedImage = {
  url: string;
  isNsfw: boolean;
};

/** Import dinâmico — evita carregar sharp/nsfwjs no GET /api/listings. */
async function classifyImageNsfw(buffer: Buffer): Promise<boolean> {
  try {
    const { isImageNsfw } = await import("@/lib/nsfw");
    return await isImageNsfw(buffer);
  } catch (error) {
    console.error("[s3] NSFW classify unavailable:", error);
    return false;
  }
}

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

export function publicUrlForKey(key: string) {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export function isOwnedListingPhotoUrl(url: string, userId: string) {
  if (!bucket || !userId) return false;
  try {
    const parsed = new URL(url);
    const expectedHost = `${bucket}.s3.${region}.amazonaws.com`;
    if (parsed.hostname !== expectedHost) return false;
    const key = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
    return key.startsWith(`listings/${userId}/`);
  } catch {
    return false;
  }
}

export function pickListingAvatar(
  photos: string[],
  avatar?: string | null,
) {
  const unique = [...new Set(photos)];
  const photoUrl =
    avatar && unique.includes(avatar) ? avatar : (unique[0] ?? null);
  return { photos: unique, photoUrl };
}

export async function createListingPhotoPresign(
  userId: string,
  contentType: string,
) {
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      contentType as (typeof ALLOWED_IMAGE_TYPES)[number],
    )
  ) {
    throw new Error("Envie uma imagem (JPG, PNG ou WEBP).");
  }

  const key = `listings/${userId}/${Date.now()}-${randomBytes(6).toString("hex")}.${extensionFor(contentType)}`;
  const uploadUrl = await getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 60 },
  );

  return {
    uploadUrl,
    publicUrl: publicUrlForKey(key),
    contentType,
  };
}

export async function classifyRemoteImageNsfw(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    return classifyImageNsfw(buffer);
  } catch (error) {
    console.error("[s3] NSFW classify from URL failed:", error);
    return false;
  }
}

export async function classifyNewListingPhotos(
  photos: string[],
  alreadyNsfw: string[] = [],
) {
  const known = new Set(alreadyNsfw);
  const nsfwPhotos: string[] = photos.filter((url) => known.has(url));
  for (const url of photos) {
    if (known.has(url)) continue;
    if (await classifyRemoteImageNsfw(url)) {
      nsfwPhotos.push(url);
    }
  }
  return nsfwPhotos;
}

export async function uploadImageToS3(
  file: File,
  folder: string,
  maxBytes = MAX_PHOTO_BYTES,
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
    classifyNsfw ? classifyImageNsfw(buffer) : Promise.resolve(false),
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
