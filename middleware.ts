import { NextResponse, type NextRequest } from "next/server";
import { prefersMarkdown } from "@/lib/markdown-negotiation";

const SKIP_PREFIXES = [
  "/api/",
  "/_next/",
  "/markdown-negotiate",
  "/openapi.json",
  "/llms.txt",
  "/auth.md",
  "/agent/",
  "/mcp",
  "/webmcp.js",
  "/sitemap.xml",
  "/robots.txt",
  "/favicon",
  "/opengraph-image",
];

const SKIP_EXTENSIONS = [
  ".js",
  ".css",
  ".map",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".json",
  ".xml",
  ".txt",
  ".md",
];

function shouldSkip(pathname: string) {
  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  return SKIP_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  // Internal HTML fetch from /markdown-negotiate must not re-enter negotiation.
  if (request.headers.get("x-markdown-bypass") === "1") {
    return NextResponse.next();
  }

  if (shouldSkip(pathname)) {
    return NextResponse.next();
  }

  if (!prefersMarkdown(request.headers.get("accept"))) {
    const response = NextResponse.next();
    response.headers.append("Vary", "Accept");
    return response;
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = "/markdown-negotiate";
  rewriteUrl.search = "";
  rewriteUrl.searchParams.set("path", `${pathname}${search}`);
  rewriteUrl.searchParams.set("method", request.method);

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/|oauth/|agent/|mcp|\\.well-known/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|woff2?|json|xml|txt|md)$).*)",
  ],
};
