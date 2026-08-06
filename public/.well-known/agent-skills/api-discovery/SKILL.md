---
name: api-discovery
description: Descubra e chame as APIs HTTP do Mulheres usando o catálogo RFC 9727, OpenAPI, metadados OAuth protected-resource e status de saúde. Use ao integrar de forma programática ou depurar conectividade de agentes.
---

# Descoberta de APIs

Use esta skill para localizar as interfaces máquina do Mulheres antes de chamá-las.

## Ordem de bootstrap

1. `GET /.well-known/api-catalog` — linkset RFC 9727 dos anchors de API
2. `GET /openapi.json` — descrição de serviço OpenAPI 3.1
3. `GET /api/health` — liveness
4. `GET /.well-known/oauth-protected-resource` — metadados do resource para APIs Bearer
5. `GET /.well-known/oauth-authorization-server` — metadados do AS (+ `agent_auth`)

Os headers `Link` da home também anunciam essas relações (`api-catalog`, `service-desc`, `status`, `oauth-protected-resource`).

## Auth

Rotas protegidas retornam `401` com:

```http
WWW-Authenticate: Bearer resource_metadata="https://mulheresdeluxo.com.br/.well-known/oauth-protected-resource"
```

Siga o Auth.md (`/auth.md`) ou o endpoint de token OAuth (`/oauth/token`) para obter um access token e então:

```http
Authorization: Bearer <access_token>
```

## Endpoints públicos úteis

| Path                       | Finalidade                 |
| -------------------------- | -------------------------- |
| `/api/health`              | Health em JSON             |
| `/openapi.json`            | OpenAPI                    |
| `/.well-known/api-catalog` | Catálogo linkset           |
| `/llms.txt`                | Resumo do site para LLMs   |
| `/mcp`                     | MCP Streamable HTTP        |

## Skills relacionadas

- `search-listings` — busca no catálogo via MCP/HTTP
- `agent-auth` — fluxo de registro Auth.md
- `mcp-catalog` — MCP Server Card + tools
