/**
 * Early WebMCP bootstrap for scanners that probe before React hydration.
 * Prefer the React WebMcp component for lifecycle; this script is a fallback
 * that calls provideContext / registerTool as soon as the document is interactive.
 */
(function mulheresWebMcpBootstrap() {
  if (typeof window === "undefined") return;

  function getCtx() {
    return (
      (navigator && navigator.modelContext) ||
      (document && document.modelContext) ||
      null
    );
  }

  function textResult(data, isError) {
    return {
      content: [
        {
          type: "text",
          text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
        },
      ],
      isError: Boolean(isError),
    };
  }

  async function mcpCall(name, args) {
    const res = await fetch("/mcp", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: { name: name, arguments: args || {} },
      }),
    });
    const body = await res.json();
    if (body.error) throw new Error(body.error.message || "MCP error");
    return body.result;
  }

  var tools = [
    {
      name: "searchListings",
      description:
        "Search Mulheres companion listings by city, neighborhood, or free text.",
      inputSchema: {
        type: "object",
        properties: {
          city: { type: "string" },
          neighborhood: { type: "string" },
          q: { type: "string" },
          limit: { type: "integer", minimum: 1, maximum: 50, default: 10 },
        },
      },
      execute: async function (args) {
        try {
          return textResult(await mcpCall("search_listings", args));
        } catch (e) {
          return textResult(String(e && e.message ? e.message : e), true);
        }
      },
    },
    {
      name: "navigateTo",
      description: "Navigate to a same-origin Mulheres path or URL.",
      inputSchema: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
      execute: async function (args) {
        try {
          var url = new URL(String(args.path || "/"), location.origin);
          if (url.origin !== location.origin) {
            return textResult("Only same-origin navigation is allowed.", true);
          }
          location.assign(url.pathname + url.search + url.hash);
          return textResult({ navigatedTo: url.pathname + url.search });
        } catch (e) {
          return textResult("Invalid path.", true);
        }
      },
    },
    {
      name: "openCatalog",
      description: "Open /catalogo with optional search filters.",
      inputSchema: {
        type: "object",
        properties: {
          search: { type: "string" },
          city: { type: "string" },
          neighborhood: { type: "string" },
        },
      },
      execute: async function (args) {
        var params = new URLSearchParams();
        if (args.search) params.set("search", String(args.search));
        if (args.city) params.set("city", String(args.city));
        if (args.neighborhood) params.set("neighborhood", String(args.neighborhood));
        var qs = params.toString();
        var path = qs ? "/catalogo?" + qs : "/catalogo";
        location.assign(path);
        return textResult({ navigatedTo: path });
      },
    },
    {
      name: "getDiscovery",
      description: "Return agent-discovery URLs for Mulheres.",
      inputSchema: { type: "object", properties: {} },
      execute: async function () {
        try {
          return textResult(await mcpCall("get_discovery", {}));
        } catch (e) {
          var o = location.origin;
          return textResult({
            openapi: o + "/openapi.json",
            apiCatalog: o + "/.well-known/api-catalog",
            authMd: o + "/auth.md",
            mcpServerCard: o + "/.well-known/mcp/server-card.json",
            mcp: o + "/mcp",
            agentSkills: o + "/.well-known/agent-skills/index.json",
            health: o + "/api/health",
            llms: o + "/llms.txt",
          });
        }
      },
    },
    {
      name: "getHealth",
      description: "Check Mulheres API health.",
      inputSchema: { type: "object", properties: {} },
      execute: async function () {
        try {
          var res = await fetch("/api/health");
          return textResult(await res.json(), !res.ok);
        } catch (e) {
          return textResult(String(e && e.message ? e.message : e), true);
        }
      },
    },
  ];

  function register() {
    var ctx = getCtx();
    if (!ctx) return false;

    // Imperative draft still used by some agents/scanners.
    if (typeof ctx.provideContext === "function") {
      try {
        ctx.provideContext({ tools: tools });
      } catch (e1) {
        try {
          ctx.provideContext(tools);
        } catch (e2) {
          /* ignore */
        }
      }
    }

    if (typeof ctx.registerTool === "function") {
      for (var i = 0; i < tools.length; i++) {
        try {
          ctx.registerTool(tools[i]);
        } catch (e) {
          /* already registered */
        }
      }
    }

    window.__mulheresWebMcpRegistered = true;
    return true;
  }

  if (register()) return;

  // Polyfills may attach modelContext slightly after first script run.
  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    if (register() || tries > 40) clearInterval(timer);
  }, 250);
})();
