---
name: webmcp
description: Expose Mulheres site actions to in-browser AI agents via the WebMCP API (navigator.modelContext.registerTool / provideContext). Use when verifying or extending browser tool registration.
---

# WebMCP

Mulheres registers WebMCP tools on every page load via `/webmcp.js` and the `WebMcp` React component.

## Detection

Agents/scanners should observe calls to:

- `navigator.modelContext.provideContext({ tools })` (legacy draft)
- `navigator.modelContext.registerTool({ name, description, inputSchema, execute })`

Feature-detect with `"modelContext" in navigator` (HTTPS / secure context).

## Tools

| Name | Purpose |
|------|---------|
| `searchListings` | Search published listings (via `/mcp`) |
| `navigateTo` | Same-origin navigation |
| `openCatalog` | Open `/catalogo` with filters |
| `getDiscovery` | Discovery URLs |
| `getHealth` | `/api/health` |

Each tool includes JSON Schema `inputSchema` and an async `execute` callback.

## Cleanup

The React provider uses `AbortController` and `unregisterTool` on unmount so tools do not leak across navigations.
