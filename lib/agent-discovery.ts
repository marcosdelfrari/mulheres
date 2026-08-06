import { createHash } from "crypto";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

/** A2A-style agent card for DNS-AID / agent discovery. */
export function buildAgentCard() {
  return {
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    provider: {
      organization: SITE_NAME,
      url: absoluteUrl("/"),
    },
    version: "1.0.0",
    documentationUrl: absoluteUrl("/guias/como-funciona"),
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: false,
    },
    defaultInputModes: ["text"],
    defaultOutputModes: ["text", "application/json"],
    skills: [
      {
        id: "catalog-search",
        name: "Companion catalog",
        description:
          "Discover verified companion profiles by city, neighborhood and filters.",
        tags: ["catalog", "search", "bh"],
        examples: [
          "Acompanhantes em Belo Horizonte",
          "Perfis em Savassi",
        ],
        inputModes: ["text"],
        outputModes: ["text", "application/json"],
      },
      {
        id: "api-catalog",
        name: "API catalog",
        description: "RFC 9727 API catalog and OpenAPI surface.",
        tags: ["api", "discovery"],
        examples: ["List public HTTP APIs"],
        inputModes: ["text"],
        outputModes: ["application/json"],
      },
    ],
    endpoints: {
      apiCatalog: absoluteUrl("/.well-known/api-catalog"),
      openapi: absoluteUrl("/openapi.json"),
      llms: absoluteUrl("/llms.txt"),
      authMd: absoluteUrl("/auth.md"),
      mcpServerCard: absoluteUrl("/.well-known/mcp/server-card.json"),
      mcp: absoluteUrl("/mcp"),
      agentSkills: absoluteUrl("/.well-known/agent-skills/index.json"),
      contact: absoluteUrl("/contato"),
      catalog: absoluteUrl("/catalogo"),
    },
  };
}

export function buildAgentIndex() {
  const card = buildAgentCard();
  return {
    version: "1.0",
    organization: SITE_NAME,
    domain: new URL(absoluteUrl("/")).hostname,
    updatedAt: new Date().toISOString().slice(0, 10),
    agents: [
      {
        id: "mulheres-web",
        name: card.name,
        description: card.description,
        protocols: ["https", "a2a"],
        endpoint: absoluteUrl("/"),
        wellKnown: "/.well-known/agent-card.json",
        card: absoluteUrl("/.well-known/agent-card.json"),
        apiCatalog: absoluteUrl("/.well-known/api-catalog"),
        openapi: absoluteUrl("/openapi.json"),
        documentation: absoluteUrl("/guias/como-funciona"),
      },
    ],
  };
}

export function agentCardSha256Base64Url() {
  const canonical = JSON.stringify(buildAgentCard());
  return createHash("sha256")
    .update(canonical)
    .digest("base64url");
}
