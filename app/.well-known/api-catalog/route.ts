import { absoluteUrl } from "@/lib/seo";

const PROFILE = "https://rfc-editor.org/info/rfc9727";

type LinkTarget = {
  href: string;
  type?: string;
  title?: string;
};

type CatalogEntry = {
  anchor: string;
  "service-desc": LinkTarget[];
  "service-doc": LinkTarget[];
  status: LinkTarget[];
  "service-meta"?: LinkTarget[];
};

/**
 * RFC 9727 Appendix A.1 — one linkset entry per API endpoint,
 * with service-desc / service-doc / status (RFC 8631).
 */
function buildApiCatalog() {
  const openapi: LinkTarget = {
    href: absoluteUrl("/openapi.json"),
    type: "application/openapi+json",
    title: "OpenAPI 3.1 description",
  };
  const docs: LinkTarget = {
    href: absoluteUrl("/guias/como-funciona"),
    type: "text/html",
    title: "Human documentation",
  };
  const health: LinkTarget = {
    href: absoluteUrl("/api/health"),
    type: "application/json",
    title: "Service health",
  };
  const llms: LinkTarget = {
    href: absoluteUrl("/llms.txt"),
    type: "text/plain",
    title: "LLM site summary",
  };

  const apis = [
    "/api/health",
    "/api/auth/me",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/logout",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/listings",
    "/api/profile/verify",
    "/api/luxo",
    "/oauth/token",
    "/oauth/authorize",
    "/oauth/userinfo",
    "/oauth/revoke",
    "/agent/identity",
    "/agent/identity/claim",
    "/mcp",
  ];

  const entries: CatalogEntry[] = apis.map((path) => ({
    anchor: absoluteUrl(path),
    "service-desc": [openapi],
    "service-doc": [docs],
    status: [health],
    "service-meta": [llms],
  }));

  return { linkset: entries };
}

function catalogHeaders() {
  return {
    "Content-Type": `application/linkset+json; profile="${PROFILE}"`,
    "Cache-Control": "public, max-age=3600",
    Link: [
      `</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"`,
      `</openapi.json>; rel="service-desc"; type="application/openapi+json"`,
      `</guias/como-funciona>; rel="service-doc"; type="text/html"`,
      `</api/health>; rel="status"; type="application/json"`,
    ].join(", "),
  };
}

export async function GET() {
  return new Response(JSON.stringify(buildApiCatalog(), null, 2), {
    status: 200,
    headers: catalogHeaders(),
  });
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: catalogHeaders(),
  });
}
