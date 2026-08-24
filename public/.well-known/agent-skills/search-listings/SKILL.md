---
name: search-listings
description: Busca e navega anúncios de acompanhantes verificadas no Mulheres de Luxo por cidade, bairro e filtros. Use quando um agente precisar encontrar perfis, comparar opções ou gerar deep-links para páginas públicas.
---

# Busca de anúncios

Use esta skill quando o usuário pedir para encontrar acompanhantes, anúncios ou perfis no Mulheres de Luxo.

## Interfaces preferidas

1. **MCP** (recomendado para agentes)

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

Inicialize antes com `method: "initialize"` se o cliente exigir handshake de sessão. Server card: `/.well-known/mcp/server-card.json`.

2. **Páginas HTTP do catálogo**

- Hub de cidade: `/minas-gerais/belo-horizonte`
- Bairro: `/minas-gerais/belo-horizonte/savassi`
- Listagem completa: `/acompanhantes`
- Prefira `Accept: text/markdown` para páginas HTML legíveis por máquina.

3. **OpenAPI**

Veja `/openapi.json` e `/.well-known/api-catalog` para APIs HTTP. Leituras públicas de anúncios também podem vir via MCP `search_listings`.

## Expectativas de saída

- Retorne título do perfil, cidade, bairro, preço e URL canônica.
- Conteúdo destinado a maiores de 18 anos. Não invente perfis que a API/MCP não retornou.
- Prefira perfis Luxo / verificados ao resumir.

## Descoberta relacionada

- `/llms.txt` — visão geral do site
- `/auth.md` — registro de agente quando APIs autenticadas forem necessárias
- `/.well-known/agent-skills/index.json` — outras skills do Mulheres de Luxo
