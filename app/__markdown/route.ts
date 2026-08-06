import { NextResponse, type NextRequest } from "next/server";
import {
  estimateTokens,
  htmlToAgentMarkdown,
} from "@/lib/markdown-negotiation";

export const runtime = "nodejs";

async function handle(request: NextRequest) {
  const pathParam = request.nextUrl.searchParams.get("path") || "/";
  const method = request.nextUrl.searchParams.get("method") || "GET";

  let targetPath = pathParam;
  try {
    // Guard against open redirects / external URLs.
    if (/^https?:\/\//i.test(targetPath)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }
    if (!targetPath.startsWith("/")) {
      targetPath = `/${targetPath}`;
    }
  } catch {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const origin = request.nextUrl.origin;
  const htmlUrl = new URL(targetPath, origin);

  const htmlHeaders = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie) htmlHeaders.set("cookie", cookie);
  htmlHeaders.set("accept", "text/html");
  htmlHeaders.set("x-markdown-bypass", "1");
  htmlHeaders.set("user-agent", request.headers.get("user-agent") ?? "markdown-negotiation");

  const htmlResponse = await fetch(htmlUrl, {
    method: "GET",
    headers: htmlHeaders,
    redirect: "manual",
    cache: "no-store",
  });

  if (htmlResponse.status >= 300 && htmlResponse.status < 400) {
    const location = htmlResponse.headers.get("location");
    if (location) {
      return NextResponse.redirect(new URL(location, origin), htmlResponse.status);
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
