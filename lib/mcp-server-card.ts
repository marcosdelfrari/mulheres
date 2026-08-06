import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const MCP_PROTOCOL_VERSION = "2025-03-26";
export const MCP_SERVER_VERSION = "1.0.0";
export const MCP_SERVER_NAME = "com.mulheres/catalog";

/** Path scanners look for (isitagentready / SEP-1649 discovery). */
export const MCP_SERVER_CARD_PATH = "/.well-known/mcp/server-card.json";

/** Streamable HTTP transport endpoint. */
export const MCP_TRANSPORT_PATH = "/mcp";

/**
 * MCP Server Card — scanner shape (serverInfo + transport + capabilities)
 * plus forward-compatible remotes for SEP-2127 clients.
 */
export function buildMcpServerCard() {
  const endpoint = absoluteUrl(MCP_TRANSPORT_PATH);

  return {
    $schema:
      "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    serverInfo: {
      name: MCP_SERVER_NAME,
      version: MCP_SERVER_VERSION,
      title: SITE_NAME,
      description: SITE_DESCRIPTION.slice(0, 100),
    },
    // Flat identity fields for clients that follow the experimental schema.ts.
    name: MCP_SERVER_NAME,
    version: MCP_SERVER_VERSION,
    title: SITE_NAME,
    description: SITE_DESCRIPTION.slice(0, 100),
    websiteUrl: absoluteUrl("/"),
    transport: {
      type: "streamable-http",
      endpoint,
    },
    endpoint,
    protocolVersion: MCP_PROTOCOL_VERSION,
    capabilities: {
      tools: { listChanged: false },
      resources: { subscribe: false, listChanged: false },
      prompts: { listChanged: false },
    },
    remotes: [
      {
        type: "streamable-http" as const,
        url: endpoint,
        supportedProtocolVersions: [MCP_PROTOCOL_VERSION, "2024-11-05"],
        headers: [
          {
            name: "Authorization",
            description:
              "Optional Bearer access_token from OAuth (/oauth/token or Auth.md).",
            isRequired: false,
            isSecret: true,
          },
        ],
      },
    ],
    _meta: {
      "com.mulheres/discovery": {
        serverCard: absoluteUrl(MCP_SERVER_CARD_PATH),
        openapi: absoluteUrl("/openapi.json"),
        apiCatalog: absoluteUrl("/.well-known/api-catalog"),
        authMd: absoluteUrl("/auth.md"),
        agentSkills: absoluteUrl("/.well-known/agent-skills/index.json"),
        documentation: absoluteUrl("/guias/como-funciona"),
      },
    },
  };
}

export function mcpCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Accept, Authorization, Mcp-Session-Id, MCP-Protocol-Version",
    "Access-Control-Expose-Headers": "Mcp-Session-Id",
  };
}
