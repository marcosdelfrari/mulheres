---
name: mcp-catalog
description: Conecte-se ao servidor MCP do Mulheres de Luxo via Server Card e endpoint Streamable HTTP. Use quando um agente com MCP precisar listar tools, buscar anúncios, ler resources de descoberta ou executar o prompt find_companions.
---

# Catálogo MCP

## Descobrir

```http
GET /.well-known/mcp/server-card.json
```

Alternativa: `GET /mcp/server-card`.

Campos do card a usar:

- `serverInfo.name` / `serverInfo.version`
- `transport.type` = `streamable-http`
- `transport.endpoint` → `https://mulheresdeluxo.com.br/mcp`
- `capabilities` para tools, resources e prompts

## Conectar

```http
POST /mcp
Content-Type: application/json
Accept: application/json
```

1. `initialize` com protocol version `2025-03-26`
2. `notifications/initialized` (sem id de resposta)
3. `tools/list` / `tools/call`
4. Opcional: `resources/list`, `prompts/list`

## Tools

| Tool              | Finalidade                                              |
| ----------------- | ------------------------------------------------------- |
| `health`          | Saúde do serviço                                        |
| `search_listings` | Anúncios publicados por cidade / bairro / q             |
| `get_discovery`   | Links para OpenAPI, Auth.md e metadados OAuth           |

## Resources / prompts

- Resources: OpenAPI, `llms.txt`, `auth.md`
- Prompt: `find_companions` com `city` / `neighborhood` opcionais

Header Bearer OAuth opcional para operações MCP protegidas no futuro — veja a skill `agent-auth` e `/auth.md`.
