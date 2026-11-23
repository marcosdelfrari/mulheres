const bucket =
  process.env.NEXT_PUBLIC_S3_BUCKET ??
  process.env.AWS_S3_BUCKET ??
  "mulheres-luxo-bucket";
const region =
  process.env.NEXT_PUBLIC_AWS_REGION ?? process.env.AWS_REGION ?? "us-east-2";

/** Chave S3 a partir da URL persistida no banco (somente bucket deste projeto). */
export function listingPhotoKeyFromUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const expectedHost = `${bucket}.s3.${region}.amazonaws.com`;
    if (parsed.hostname !== expectedHost) return null;
    const key = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
    if (!key.startsWith("listings/")) return null;
    return key;
  } catch {
    return null;
  }
}

/**
 * Bucket é privado — leitura pública via `/api/photos/...` com credenciais no servidor.
 */
export function listingPhotoDisplayUrl(url: string): string {
  const key = listingPhotoKeyFromUrl(url);
  if (!key) return url;
  const encodedPath = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `/api/photos/${encodedPath}`;
}