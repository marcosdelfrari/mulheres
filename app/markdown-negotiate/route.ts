import { NextResponse, type NextRequest } from "next/server";
import {
  estimateTokens,
  htmlToAgentMarkdown,
} from "@/lib/markdown-negotiation";

export const runtime = "nodejs";

/** Internal converter — not a private `_` folder (those are unroutable in App Router). */
function resolveOrigin(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.host;
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (request.nextUrl.protocol.replace(":", "") || "https");
  return `${proto}://${host}`;
}

async function handle(request: NextRequest) {
  const pathParam = request.nextUrl.searchParams.get("path") || "/";
  const method = request.nextUrl.searchParams.get("method") || "GET";

  let targetPath = pathParam;
  try {
    if (/^https?:\/\//i.test(targetPath)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }
    if (!targetPath.startsWith("/")) {
      targetPath = `/${targetPath}`;
    }
  } catch {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const origin = resolveOrigin(request);
  const htmlUrl = new URL(targetPath, origin);

  const htmlHeaders = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie) htmlHeaders.set("cookie", cookie);
  htmlHeaders.set("accept", "text/html");
  htmlHeaders.set("x-markdown-bypass", "1");
  htmlHeaders.set(
    "user-agent",
    request.headers.get("user-agent") ?? "markdown-negotiation",
  );

  let htmlResponse = await fetch(htmlUrl, {
    method: "GET",
    headers: htmlHeaders,
    redirect: "manual",
    cache: "no-store",
  });

  // Follow one same-origin redirect (apex ↔ www) so conversion still works.
  if (htmlResponse.status >= 300 && htmlResponse.status < 400) {
    const location = htmlResponse.headers.get("location");
    if (location) {
      const nextUrl = new URL(location, origin);
      const sameHost =
        nextUrl.hostname === new URL(origin).hostname ||
        nextUrl.hostname.replace(/^www\./, "") ===
          new URL(origin).hostname.replace(/^www\./, "");
      if (sameHost) {
        htmlResponse = await fetch(nextUrl, {
          method: "GET",
          headers: htmlHeaders,
          redirect: "manual",
          cache: "no-store",
        });
      } else {
        return NextResponse.redirect(nextUrl, htmlResponse.status);
      }
    }
  }

  const contentType = htmlResponse.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    return new NextResponse(await htmlResponse.arrayBuffer(), {
      status: htmlResponse.status,
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        Vary: "Accept",
      },
    });
  }

  const html = await htmlResponse.text();
  const markdown = htmlToAgentMarkdown(html);

  const headers = new Headers({
    "Content-Type": "text/markdown; charset=utf-8",
    Vary: "Accept",
    "Cache-Control": "public, max-age=60",
    "x-markdown-tokens": String(estimateTokens(markdown)),
    "x-original-tokens": String(estimateTokens(html)),
    "content-signal":
      htmlResponse.headers.get("content-signal") ??
      "ai-train=no, search=yes, ai-input=yes",
  });

  if (method === "HEAD") {
    return new NextResponse(null, {
      status: htmlResponse.status,
      headers,
    });
  }

  return new NextResponse(markdown, {
    status: htmlResponse.status,
    headers,
  });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function HEAD(request: NextRequest) {
  return handle(request);
}
