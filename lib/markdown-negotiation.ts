import { NodeHtmlMarkdown } from "node-html-markdown";

const STRIP_SELECTORS = [
  "script",
  "style",
  "noscript",
  "template",
  "svg",
  "iframe",
  "nav",
  "header",
  "footer",
  "[role='navigation']",
  "[role='banner']",
  "[role='contentinfo']",
];

function metaContent(html: string, ...patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1].trim());
  }
  return null;
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractTitle(html: string) {
  return (
    metaContent(
      html,
      /<meta[^>]+name=["']title["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']title["']/i,
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    ) ??
    metaContent(html, /<title[^>]*>([^<]*)<\/title>/i)
  );
}

function extractDescription(html: string) {
  return metaContent(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
  );
}

function extractImage(html: string) {
  return metaContent(
    html,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
  );
}

function extractJsonLd(html: string): string[] {
  const blocks: string[] = [];
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      blocks.push(JSON.stringify(JSON.parse(raw)));
    } catch {
      blocks.push(raw);
    }
  }
  return blocks;
}

function stripChrome(html: string) {
  let cleaned = html;
  for (const selector of STRIP_SELECTORS) {
    if (selector.startsWith("[")) {
      const attr = selector.slice(1, -1);
      const re = new RegExp(
        `<[^>]+${attr.replace("=", "\\s*=\\s*")}[^>]*>[\\s\\S]*?<\\/[^>]+>`,
        "gi",
      );
      cleaned = cleaned.replace(re, "");
      continue;
    }
    const re = new RegExp(
      `<${selector}(?:\\s[^>]*)?>[\\s\\S]*?<\\/${selector}>`,
      "gi",
    );
    cleaned = cleaned.replace(re, "");
    cleaned = cleaned.replace(new RegExp(`<${selector}(?:\\s[^>]*)?\\/?>`, "gi"), "");
  }

  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch?.[1] ?? cleaned;
}

function yamlEscape(value: string) {
  if (/[:#{}[\],&*?|<>=!%@`]/.test(value) || value.includes("\n")) {
    return JSON.stringify(value);
  }
  return value;
}

function buildFrontmatter(html: string) {
  const title = extractTitle(html);
  const description = extractDescription(html);
  const image = extractImage(html);
  if (!title && !description && !image) return "";

  const lines = ["---"];
  if (title) lines.push(`title: ${yamlEscape(title)}`);
  if (description) lines.push(`description: ${yamlEscape(description)}`);
  if (image) lines.push(`image: ${yamlEscape(image)}`);
  lines.push("---", "");
  return lines.join("\n");
}

/** Rough token estimate used when a tokenizer is unavailable. */
export function estimateTokens(text: string) {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

export function htmlToAgentMarkdown(html: string) {
  const frontmatter = buildFrontmatter(html);
  const jsonLd = extractJsonLd(html);
  const bodyHtml = stripChrome(html);

  const bodyMarkdown = NodeHtmlMarkdown.translate(bodyHtml, {
    keepDataImages: false,
    useLinkReferenceDefinitions: false,
    maxConsecutiveNewlines: 2,
  }).trim();

  const parts = [frontmatter, bodyMarkdown];

  if (jsonLd.length > 0) {
    parts.push("", "```json", jsonLd.join("\n"), "```");
  }

  return parts.filter(Boolean).join("\n").trim() + "\n";
}

/**
 * Returns true when the client prefers text/markdown over text/html.
 * `Accept: text/markdown` alone → true; browsers sending text/html first → false.
 */
export function prefersMarkdown(acceptHeader: string | null): boolean {
  if (!acceptHeader) return false;

  const parts = acceptHeader.split(",").map((part) => {
    const [type, ...params] = part.trim().split(";").map((s) => s.trim());
    const qParam = params.find((p) => p.startsWith("q="));
    const q = qParam ? Number(qParam.slice(2)) : 1;
    return { type: type.toLowerCase(), q: Number.isFinite(q) ? q : 1 };
  });

  const markdown = parts
    .filter((p) => p.type === "text/markdown" || p.type === "text/*" || p.type === "*/*")
    .sort((a, b) => b.q - a.q)[0];

  const html = parts
    .filter((p) => p.type === "text/html" || p.type === "text/*" || p.type === "*/*")
    .sort((a, b) => b.q - a.q)[0];

  const mdExact = parts.find((p) => p.type === "text/markdown");
  if (!mdExact) return false;

  if (!html || html.type !== "text/html") {
    return mdExact.q > 0;
  }

  return mdExact.q >= html.q && mdExact.q > 0;
}
