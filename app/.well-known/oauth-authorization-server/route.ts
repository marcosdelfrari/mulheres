import { buildOAuthAuthorizationServerMetadata } from "@/lib/oauth";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(buildOAuthAuthorizationServerMetadata(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "application/json",
    },
  });
}
