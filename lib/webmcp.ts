import type { WebMcpModelContext, WebMcpTool, WebMcpToolResult } from "@/lib/webmcp-types";

function textResult(data: unknown, isError = false): WebMcpToolResult {
  const text =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return {
    content: [{ type: "text", text }],
    ...(isError ? { isError: true } : {}),
  };
}

async function mcpRpc(method: string, params?: Record<string, unknown>) {
  const res = await fetch("/mcp", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
  });
  if (!res.ok) {
    throw new Error(`MCP HTTP ${res.status}`);
  }
  const body = (await res.json()) as {
    result?: unknown;
    error?: { message?: string };
  };
  if (body.error) {
    throw new Error(body.error.message ?? "MCP error");
  }
  return body.result;
}

function buildTools(): WebMcpTool[] {
  return [
    {
      name: "searchListings",
      description:
        "Search Mulheres companion listings by city, neighborhood, or free text. Returns published profiles with title, price, location, and URL.",
      annotations: { readOnlyHint: true, openWorldHint: false },
      inputSchema: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "City name (e.g. Belo Horizonte)",
          },
          neighborhood: {
            type: "string",
            description: "Neighborhood / bairro (e.g. Savassi)",
          },
          q: {
            type: "string",
            description: "Free-text query against title or description",
          },
          limit: {
            type: "integer",
            minimum: 1,
            maximum: 50,
            default: 10,
            description: "Maximum results (default 10)",
          },
        },
        additionalProperties: false,
      },
      async execute(args) {
        try {
          const result = await mcpRpc("tools/call", {
            name: "search_listings",
            arguments: args,
          });
          return textResult(result);
        } catch (e) {
          return textResult(
            e instanceof Error ? e.message : "searchListings failed",
            true,
          );
        }
      },
    },
    {
      name: "navigateTo",
      description:
        "Navigate the browser to a Mulheres site path or absolute URL on this origin (catalog, city hubs, guides, auth, account).",
      annotations: { readOnlyHint: false, openWorldHint: false },
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "Path or URL, e.g. /catalogo, /minas-gerais/belo-horizonte, /guias/como-funciona",
          },
        },
        required: ["path"],
        additionalProperties: false,
      },
      async execute(args) {
        const raw = String(args.path ?? "/");
        try {
          const url = new URL(raw, window.location.origin);
          if (url.origin !== window.location.origin) {
            return textResult("Only same-origin navigation is allowed.", true);
          }
          window.location.assign(url.pathname + url.search + url.hash);
          return textResult({ navigatedTo: url.pathname + url.search });
        } catch {
          return textResult("Invalid path.", true);
        }
      },
    },
    {
      name: "openCatalog",
      description:
        "Open the companion catalog with optional search/city filters applied in the URL.",
      annotations: { readOnlyHint: false, openWorldHint: false },
      inputSchema: {
        type: "object",
        properties: {
          search: {
            type: "string",
            description: "Search query for the catalog",
          },
          city: {
            type: "string",
            description: "City filter",
          },
          neighborhood: {
            type: "string",
            description: "Neighborhood filter",
          },
        },
        additionalProperties: false,
      },
      async execute(args) {
        const params = new URLSearchParams();
        if (typeof args.search === "string" && args.search.trim()) {
          params.set("search", args.search.trim());
        }
        if (typeof args.city === "string" && args.city.trim()) {
          params.set("city", args.city.trim());
        }
        if (typeof args.neighborhood === "string" && args.neighborhood.trim()) {
          params.set("neighborhood", args.neighborhood.trim());
        }
        const qs = params.toString();
        const path = qs ? `/catalogo?${qs}` : "/catalogo";
        window.location.assign(path);
        return textResult({ navigatedTo: path });
      },
    },
    {
      name: "getDiscovery",
      description:
        "Return Mulheres agent-discovery links (OpenAPI, API catalog, Auth.md, MCP Server Card, Agent Skills, OAuth metadata, health).",
      annotations: { readOnlyHint: true, openWorldHint: false },
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      async execute() {
        try {
          const result = await mcpRpc("tools/call", {
            name: "get_discovery",
            arguments: {},
          });
          return textResult(result);
        } catch {
          const origin = window.location.origin;
          return textResult({
            openapi: `${origin}/openapi.json`,
            apiCatalog: `${origin}/.well-known/api-catalog`,
            authMd: `${origin}/auth.md`,
            mcpServerCard: `${origin}/.well-known/mcp/server-card.json`,
            mcp: `${origin}/mcp`,
            agentSkills: `${origin}/.well-known/agent-skills/index.json`,
            oauthProtectedResource: `${origin}/.well-known/oauth-protected-resource`,
            oauthAuthorizationServer: `${origin}/.well-known/oauth-authorization-server`,
            health: `${origin}/api/health`,
            llms: `${origin}/llms.txt`,
          });
        }
      },
    },
    {
      name: "getHealth",
      description: "Check Mulheres API health status.",
      annotations: { readOnlyHint: true, openWorldHint: false },
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      async execute() {
        try {
          const res = await fetch("/api/health", { headers: { Accept: "application/json" } });
          const data = await res.json();
          return textResult(data, !res.ok);
        } catch (e) {
          return textResult(
            e instanceof Error ? e.message : "getHealth failed",
            true,
          );
        }
      },
    },
  ];
}

function getModelContext(): WebMcpModelContext | null {
  if (typeof navigator !== "undefined" && navigator.modelContext) {
    return navigator.modelContext;
  }
  if (typeof document !== "undefined" && document.modelContext) {
    return document.modelContext;
  }
  return null;
}

/**
 * Register Mulheres WebMCP tools for browser AI agents.
 * Supports current `registerTool` and legacy `provideContext`.
 */
export async function registerWebMcpTools(signal?: AbortSignal) {
  const ctx = getModelContext();
  if (!ctx) return { registered: false as const, reason: "unsupported" as const };

  const tools = buildTools();
  const names = tools.map((t) => t.name);

  const onAbort = () => {
    for (const name of names) {
      try {
        void ctx.unregisterTool?.(name);
      } catch {
        // ignore
      }
    }
  };

  if (signal) {
    if (signal.aborted) {
      onAbort();
      return { registered: false as const, reason: "aborted" as const };
    }
    signal.addEventListener("abort", onAbort, { once: true });
  }

  // Legacy draft API (still referenced by some readiness scanners / user agents).
  if (typeof ctx.provideContext === "function") {
    try {
      await ctx.provideContext({ tools });
    } catch {
      try {
        await ctx.provideContext(tools);
      } catch {
        // fall through to registerTool
      }
    }
  }

  if (typeof ctx.registerTool === "function") {
    for (const tool of tools) {
      if (signal?.aborted) break;
      try {
        await ctx.registerTool(tool, signal ? { signal } : undefined);
      } catch {
        try {
          await ctx.registerTool(tool);
        } catch {
          // Tool may already be registered (HMR / duplicate provideContext).
        }
      }
    }
  }

  if (typeof window !== "undefined") {
    window.__mulheresWebMcpRegistered = true;
  }

  return { registered: true as const, tools: names };
}

export function listWebMcpToolNames() {
  return buildTools().map((t) => t.name);
}
