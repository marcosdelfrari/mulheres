import {
  buildProtectedResourceMetadata,
} from "@/lib/oauth";

export const runtime = "nodejs";

const headers = {
  "Cache-Control": "public, max-age=3600",
  "Content-Type": "application/json; charset=utf-8",
};

export async function GET() {
  return Response.json(buildProtectedResourceMetadata(), { headers });
}

export async function HEAD() {
  return new Response(null, { status: 200, headers });
}
