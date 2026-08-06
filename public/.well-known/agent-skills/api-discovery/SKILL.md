---
name: api-discovery
description: Discover and call Mulheres HTTP APIs using the RFC 9727 API catalog, OpenAPI, OAuth protected-resource metadata, and health status. Use when integrating programmatically or debugging agent connectivity.
---

# API discovery

Use this skill to locate Mulheres machine interfaces before calling them.

## Bootstrap order

1. `GET /.well-known/api-catalog` — RFC 9727 linkset of API anchors
2. `GET /openapi.json` — OpenAPI 3.1 service description
3. `GET /api/health` — liveness
4. `GET /.well-known/oauth-protected-resource` — resource metadata for Bearer APIs
5. `GET /.well-known/oauth-authorization-server` — AS metadata (+ `agent_auth`)

Home page `Link` headers also advertise these relations (`api-catalog`, `service-desc`, `status`, `oauth-protected-resource`).

## Auth

Protected routes return `401` with:

```http
WWW-Authenticate: Bearer resource_metadata="https://mulheresdeluxo.com.br/.well-known/oauth-protected-resource"
```

Follow Auth.md (`/auth.md`) or OAuth token endpoint (`/oauth/token`) to obtain an access token, then:

```http
Authorization: Bearer <access_token>
```

## Useful public endpoints

| Path                       | Purpose             |
| -------------------------- | ------------------- |
| `/api/health`              | Health JSON         |
| `/openapi.json`            | OpenAPI             |
| `/.well-known/api-catalog` | Linkset catalog     |
| `/llms.txt`                | LLM site summary    |
| `/mcp`                     | MCP Streamable HTTP |

## Related skills

- `search-listings` — catalog search via MCP/HTTP
- `agent-auth` — Auth.md registration flow
- `mcp-catalog` — MCP Server Card + tools
