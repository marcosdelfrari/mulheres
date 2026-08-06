import {
  buildMcpServerCard,
  mcpCorsHeaders,
} from "@/lib/mcp-server-card";

export const runtime = "nodejs";

function headers() {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
    ...mcpCorsHeaders(),
    Link: [
      `</mcp>; rel="service"; type="application/json"`,
      `</openapi.json>; rel="service-desc"`,
      `</auth.md>; rel="describedby"; type="text/markdown"`,
    ].join(", "),
  };
}

export async function GET() {
  return Response.json(buildMcpServerCard(), { headers: headers() });
}

export async function HEAD() {
  return new Response(null, { status: 200, headers: headers() });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: headers() });
}
