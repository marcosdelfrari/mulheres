---
name: search-listings
description: Search and browse verified companion listings on Mulheres by city, neighborhood, and filters. Use when an agent needs to find profiles, compare options, or deep-link to public listing pages.
---

# Search listings

Use this skill when the user asks to find companions, listings, or profiles on Mulheres.

## Preferred interfaces

1. **MCP** (recommended for agents)

```http
POST /mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_listings",
    "arguments": {
      "city": "Belo Horizonte",
      "neighborhood": "Savassi",
      "limit": 10
    }
  }
}
```

Initialize first with `method: "initialize"` if your client requires a session handshake. Server card: `/.well-known/mcp/server-card.json`.

2. **HTTP catalog pages**

- City hub: `/minas-gerais/belo-horizonte`
- Neighborhood: `/minas-gerais/belo-horizonte/savassi`
- Full catalog: `/catalogo`
- Prefer `Accept: text/markdown` for machine-readable HTML pages.

3. **OpenAPI**

See `/openapi.json` and `/.well-known/api-catalog` for HTTP APIs. Public listing reads may also be available via MCP `search_listings`.

## Output expectations

- Return profile title, city, neighborhood, price, and canonical URL.
- Content is for adults 18+. Do not invent profiles that are not returned by the API/MCP.
- Prefer Luxo / verified profiles when summarizing.

## Related discovery

- `/llms.txt` — site overview
- `/auth.md` — agent registration when authenticated APIs are needed
- `/.well-known/agent-skills/index.json` — other Mulheres skills
