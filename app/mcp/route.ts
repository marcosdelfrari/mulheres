import { absoluteUrl } from "@/lib/seo";
import {
  buildMcpServerCard,
  MCP_SERVER_CARD_PATH,
  mcpCorsHeaders,
} from "@/lib/mcp-server-card";
import { handleMcpJsonRpc } from "@/lib/mcp-server";

export const runtime = "nodejs";

function jsonHeaders(extra?: HeadersInit) {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...mcpCorsHeaders(),
    ...(extra ?? {}),
  };
}

export async function GET() {
  // Streamable HTTP may open an SSE stream on GET; advertise how to connect.
  return Response.json(
    {
      protocolVersion: buildMcpServerCard().protocolVersion,
      serverCard: absoluteUrl(MCP_SERVER_CARD_PATH),
      alternateServerCard: absoluteUrl("/mcp/server-card"),
      transport: "streamable-http",
      message: "POST JSON-RPC messages to this endpoint (MCP Streamable HTTP).",
    },
    { headers: jsonHeaders() },
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        jsonrpc: "2.0",
        error: { code: -32700, message: "Parse error" },
        id: null,
      },
      { status: 400, headers: jsonHeaders() },
    );
  }

  const result = await handleMcpJsonRpc(body);
  if (result === null) {
    return new Response(null, { status: 202, headers: jsonHeaders() });
  }

  return Response.json(result, { headers: jsonHeaders() });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: jsonHeaders() });
}

export async function HEAD() {
  return new Response(null, { status: 200, headers: jsonHeaders() });
}
