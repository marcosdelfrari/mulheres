import { absoluteUrl } from "@/lib/seo";

export const runtime = "nodejs";

/**
 * Content Signals (https://contentsignals.org/)
 * search  — indexing / classic search results
 * ai-input — RAG, grounding, agentic retrieval
 * ai-train — training / fine-tuning models
 */
const CONTENT_SIGNAL = "ai-train=no, search=yes, ai-input=yes";

const PRIVATE_PATHS = [
  "/login",
  "/criar-conta",
  "/recuperar-senha",
  "/redefinir-senha",
  "/perfil",
  "/conta",
  "/api/",
  "/__markdown",
];

function disallowBlock(paths: string[]) {
  return paths.map((path) => `Disallow: ${path}`).join("\n");
}

function buildRobotsTxt() {
  const sitemap = absoluteUrl("/sitemap.xml");

  return `# As a condition of accessing this website, you agree to
# abide by the following content signals:
# (a)  If a content-signal = yes, you may collect content
#      for the corresponding use.
# (b)  If a content-signal = no, you may not collect content
#      for the corresponding use.
# (c)  If the website operator does not include a content
#      signal for a corresponding use, the website operator
#      neither grants nor restricts permission via content
#      signal with respect to the corresponding use.
#
# The content signals and their meanings are:
# search: building a search index and providing search
# results (e.g., returning hyperlinks and short excerpts).
# Search does not include providing AI-generated search summaries.
# ai-input: inputting content into one or more AI models
# (e.g., retrieval augmented generation, grounding, or other
# real-time taking of content for generative AI search answers).
# ai-train: training or fine-tuning AI models.
#
# ANY RESTRICTIONS EXPRESSED VIA CONTENT SIGNALS ARE EXPRESS
# RESERVATIONS OF RIGHTS UNDER ARTICLE 4 OF THE EUROPEAN
# UNION DIRECTIVE 2019/790 ON COPYRIGHT AND RELATED RIGHTS
# IN THE DIGITAL SINGLE MARKET.

User-agent: *
Content-Signal: ${CONTENT_SIGNAL}
Allow: /
Allow: /.well-known/
Allow: /openapi.json
Allow: /llms.txt
Allow: /auth.md
Allow: /oauth/
Allow: /agent/
Allow: /mcp
${disallowBlock(PRIVATE_PATHS)}

User-agent: GPTBot
Content-Signal: ${CONTENT_SIGNAL}
Allow: /
Allow: /llms.txt
Allow: /auth.md
Allow: /.well-known/
Allow: /openapi.json
Allow: /guias/
Allow: /minas-gerais/
${disallowBlock(PRIVATE_PATHS)}

User-agent: ChatGPT-User
Content-Signal: ${CONTENT_SIGNAL}
Allow: /
Allow: /llms.txt
Allow: /auth.md
Allow: /.well-known/
Allow: /openapi.json
Allow: /guias/
Allow: /minas-gerais/
${disallowBlock(PRIVATE_PATHS)}

User-agent: ClaudeBot
Content-Signal: ${CONTENT_SIGNAL}
Allow: /
Allow: /llms.txt
Allow: /auth.md
Allow: /.well-known/
Allow: /openapi.json
Allow: /guias/
Allow: /minas-gerais/
${disallowBlock(PRIVATE_PATHS)}

User-agent: PerplexityBot
Content-Signal: ${CONTENT_SIGNAL}
Allow: /
Allow: /llms.txt
Allow: /auth.md
Allow: /.well-known/
Allow: /openapi.json
${disallowBlock(PRIVATE_PATHS)}

Sitemap: ${sitemap}
`;
}

export function GET() {
  return new Response(buildRobotsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
