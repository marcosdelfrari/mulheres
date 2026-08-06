import { buildMcpServerCard } from "@/lib/mcp-server-card";
import { mcpCorsHeaders } from "@/lib/mcp-server-card";

export const runtime = "nodejs";

/** Alternate recommended path: GET /mcp/server-card */
export async function GET() {
  return Response.json(buildMcpServerCard(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      ...mcpCorsHeaders(),
    },
  });
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      ...mcpCorsHeaders(),
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: mcpCorsHeaders(),
  });
}
