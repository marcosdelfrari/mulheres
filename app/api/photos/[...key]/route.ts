import { getListingPhotoObject } from "@/lib/s3";

export const runtime = "nodejs";

const CACHE = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

type RouteParams = { params: Promise<{ key: string[] }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { key: segments } = await params;
  const key = segments.map((part) => decodeURIComponent(part)).join("/");

  if (!key.startsWith("listings/") || key.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const object = await getListingPhotoObject(key);
    const body = object.Body;
    if (!body) {
      return new Response("Not found", { status: 404 });
    }

    const bytes = await body.transformToByteArray();

    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": object.ContentType ?? "image/jpeg",
        "Cache-Control": CACHE,
      },
    });
  } catch (error) {
    console.error("[photos]", key, error);
    return new Response("Not found", { status: 404 });
  }
}