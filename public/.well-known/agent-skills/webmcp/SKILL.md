---
name: webmcp
description: Expõe ações do site Mulheres a agentes de IA no navegador via API WebMCP (navigator.modelContext.registerTool / provideContext). Use ao verificar ou estender o registro de tools no browser.
---

# WebMCP

O Mulheres registra tools WebMCP em cada carregamento de página via `/webmcp.js` e o componente React `WebMcp`.

## Detecção

Agentes/scanners devem observar chamadas a:

- `navigator.modelContext.provideContext({ tools })` (draft legado)
- `navigator.modelContext.registerTool({ name, description, inputSchema, execute })`

Faça feature-detect com `"modelContext" in navigator` (HTTPS / secure context).

## Tools

| Name | Finalidade |
|------|------------|
| `searchListings` | Busca anúncios publicados (via `/mcp`) |
| `navigateTo` | Navegação same-origin |
| `openCatalog` | Abre `/acompanhantes` com filtros |
| `getDiscovery` | URLs de descoberta |
| `getHealth` | `/api/health` |

Cada tool inclui `inputSchema` em JSON Schema e um callback `execute` assíncrono.

## Cleanup

O provider React usa `AbortController` e `unregisterTool` no unmount para não vazar tools entre navegações.
