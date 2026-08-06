import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import {
  MCP_PROTOCOL_VERSION,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
  buildMcpServerCard,
} from "@/lib/mcp-server-card";

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, unknown>;
};

type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
};

const TOOLS = [
  {
    name: "health",
    description: "Service health check for Mulheres.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "search_listings",
    description:
      "Search published companion listings by city, neighborhood, or free text.",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string", description: "City name (e.g. Belo Horizonte)" },
        neighborhood: { type: "string", description: "Neighborhood / bairro" },
        q: { type: "string", description: "Free-text query against title/description" },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: 50,
          default: 10,
          description: "Max results (default 10)",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_discovery",
    description:
      "Return discovery links (OpenAPI, API catalog, Auth.md, OAuth metadata).",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
] as const;

function ok(id: JsonRpcId, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

function err(
  id: JsonRpcId,
  code: number,
  message: string,
  data?: unknown,
): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message, data } };
}

async function callTool(name: string, args: Record<string, unknown>) {
  if (name === "health") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "ok",
              service: SITE_NAME,
              time: new Date().toISOString(),
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  if (name === "get_discovery") {
    const card = buildMcpServerCard();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              site: absoluteUrl("/"),
              description: SITE_DESCRIPTION,
              mcp: card,
              openapi: absoluteUrl("/openapi.json"),
              apiCatalog: absoluteUrl("/.well-known/api-catalog"),
              authMd: absoluteUrl("/auth.md"),
              oauthProtectedResource: absoluteUrl(
                "/.well-known/oauth-protected-resource",
              ),
              oauthAuthorizationServer: absoluteUrl(
                "/.well-known/oauth-authorization-server",
              ),
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  if (name === "search_listings") {
    const limit = Math.min(
      50,
      Math.max(1, Number(args.limit ?? 10) || 10),
    );
    const city = typeof args.city === "string" ? args.city.trim() : "";
    const neighborhood =
      typeof args.neighborhood === "string" ? args.neighborhood.trim() : "";
    const q = typeof args.q === "string" ? args.q.trim() : "";

    const listings = await prisma.listing.findMany({
      where: {
        status: "published",
        ...(city
          ? { city: { contains: city, mode: "insensitive" } }
          : {}),
        ...(neighborhood
          ? { neighborhood: { contains: neighborhood, mode: "insensitive" } }
          : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ isLuxo: "desc" }, { updatedAt: "desc" }],
      take: limit,
      select: {
        id: true,
        title: true,
        city: true,
        neighborhood: true,
        region: true,
        pricePerHour: true,
        age: true,
        gender: true,
        online: true,
        isLuxo: true,
        photoUrl: true,
        photos: true,
      },
    });

    const results = listings.map((item) => ({
      id: item.id,
      title: item.title,
      city: item.city,
      neighborhood: item.neighborhood,
      region: item.region,
      pricePerHour: item.pricePerHour,
      age: item.age,
      gender: item.gender,
      online: item.online,
      isLuxo: item.isLuxo,
      photo: item.photoUrl ?? item.photos?.[0] ?? null,
      url: absoluteUrl(`/acompanhante/${item.id}`),
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ count: results.length, results }, null, 2),
        },
      ],
    };
  }

  throw Object.assign(new Error(`Unknown tool: ${name}`), { code: -32602 });
}

export async function handleMcpJsonRpc(
  body: unknown,
): Promise<JsonRpcResponse | JsonRpcResponse[] | null> {
  const messages = Array.isArray(body) ? body : [body];
  const responses: JsonRpcResponse[] = [];

  for (const raw of messages) {
    const msg = raw as JsonRpcRequest;
    const id = (msg.id ?? null) as JsonRpcId;
    const isNotification = msg.id === undefined;

    if (msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
      if (!isNotification) {
        responses.push(err(id, -32600, "Invalid Request"));
      }
      continue;
    }

    const method = msg.method;
    const params = (msg.params ?? {}) as Record<string, unknown>;

    if (method === "notifications/initialized" || method.startsWith("notifications/")) {
      continue;
    }

    if (method === "initialize") {
      responses.push(
        ok(id, {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false },
          },
          serverInfo: {
            name: MCP_SERVER_NAME,
            version: MCP_SERVER_VERSION,
            title: SITE_NAME,
          },
          instructions:
            "Mulheres companion catalog MCP. Use search_listings, health, and get_discovery tools. Auth via OAuth Bearer when calling protected HTTP APIs.",
        }),
      );
      continue;
    }

    if (method === "ping") {
      responses.push(ok(id, {}));
      continue;
    }

    if (method === "tools/list") {
      responses.push(ok(id, { tools: TOOLS }));
      continue;
    }

    if (method === "tools/call") {
      const name = String(params.name ?? "");
      const args =
        typeof params.arguments === "object" && params.arguments
          ? (params.arguments as Record<string, unknown>)
          : {};
      try {
        const result = await callTool(name, args);
        responses.push(ok(id, result));
      } catch (e) {
        const message = e instanceof Error ? e.message : "Tool call failed";
        responses.push(
          ok(id, {
            isError: true,
            content: [{ type: "text", text: message }],
          }),
        );
      }
      continue;
    }

    if (method === "resources/list") {
      responses.push(
        ok(id, {
          resources: [
            {
              uri: absoluteUrl("/openapi.json"),
              name: "openapi",
              title: "OpenAPI description",
              mimeType: "application/json",
            },
            {
              uri: absoluteUrl("/llms.txt"),
              name: "llms",
              title: "LLM site summary",
              mimeType: "text/plain",
            },
            {
              uri: absoluteUrl("/auth.md"),
              name: "auth-md",
              title: "Auth.md agent registration",
              mimeType: "text/markdown",
            },
          ],
        }),
      );
      continue;
    }

    if (method === "resources/read") {
      const uri = String(params.uri ?? "");
      const fileByUri: Record<string, { file: string; mimeType: string }> = {
        [absoluteUrl("/openapi.json")]: {
          file: "public/openapi.json",
          mimeType: "application/json",
        },
        [absoluteUrl("/llms.txt")]: {
          file: "public/llms.txt",
          mimeType: "text/plain",
        },
        [absoluteUrl("/auth.md")]: {
          file: "public/auth.md",
          mimeType: "text/markdown",
        },
      };
      const entry = fileByUri[uri];
      if (!entry) {
        responses.push(err(id, -32002, "Resource not found", { uri }));
        continue;
      }
      const { readFile } = await import("fs/promises");
      const { join } = await import("path");
      const text = await readFile(join(process.cwd(), entry.file), "utf8");
      responses.push(
        ok(id, {
          contents: [
            {
              uri,
              mimeType: entry.mimeType,
              text,
            },
          ],
        }),
      );
      continue;
    }

    if (method === "prompts/list") {
      responses.push(
        ok(id, {
          prompts: [
            {
              name: "find_companions",
              description: "Help find companions in a city or neighborhood.",
              arguments: [
                {
                  name: "city",
                  description: "City to search",
                  required: false,
                },
                {
                  name: "neighborhood",
                  description: "Neighborhood / bairro",
                  required: false,
                },
              ],
            },
          ],
        }),
      );
      continue;
    }

    if (method === "prompts/get") {
      const name = String(params.name ?? "");
      const args =
        typeof params.arguments === "object" && params.arguments
          ? (params.arguments as Record<string, string>)
          : {};
      if (name !== "find_companions") {
        responses.push(err(id, -32602, `Unknown prompt: ${name}`));
        continue;
      }
      const city = args.city ?? "Belo Horizonte";
      const neighborhood = args.neighborhood ?? "";
      responses.push(
        ok(id, {
          description: "Find companions prompt",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Search Mulheres for companions in ${city}${neighborhood ? `, neighborhood ${neighborhood}` : ""}. Use the search_listings tool and summarize verified profiles with links.`,
              },
            },
          ],
        }),
      );
      continue;
    }

    if (!isNotification) {
      responses.push(err(id, -32601, `Method not found: ${method}`));
    }
  }

  if (responses.length === 0) return null;
  if (Array.isArray(body)) return responses;
  return responses[0] ?? null;
}
