---
name: mcp-catalog
description: Connect to the Mulheres MCP server via its Server Card and Streamable HTTP endpoint. Use when an MCP-capable agent should list tools, search listings, read discovery resources, or run the find_companions prompt.
---

# MCP catalog

## Discover

```http
GET /.well-known/mcp/server-card.json
```

Alternate: `GET /mcp/server-card`.

Card fields to use:

- `serverInfo.name` / `serverInfo.version`
- `transport.type` = `streamable-http`
- `transport.endpoint` → `https://mulheresdeluxo.com.br/mcp`
- `capabilities` for tools, resources, prompts

## Connect

```http
POST /mcp
Content-Type: application/json
Accept: application/json
```

1. `initialize` with protocol version `2025-03-26`
2. `notifications/initialized` (no response id)
3. `tools/list` / `tools/call`
4. Optional: `resources/list`, `prompts/list`

## Tools

| Tool              | Purpose                                       |
| ----------------- | --------------------------------------------- |
| `health`          | Service health                                |
| `search_listings` | Published listings by city / neighborhood / q |
| `get_discovery`   | Links to OpenAPI, Auth.md, OAuth metadata     |

## Resources / prompts

- Resources: OpenAPI, `llms.txt`, `auth.md`
- Prompt: `find_companions` with optional `city` / `neighborhood`

Optional OAuth Bearer header for future protected MCP operations — see `agent-auth` skill and `/auth.md`.
