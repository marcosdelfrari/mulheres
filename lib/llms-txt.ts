import {
  formatCityNamesPhrase,
  getActiveLocationLinks,
} from "@/lib/active-locations";
import { SITE_URL } from "@/lib/seo";

export async function buildLlmsTxt(): Promise<string> {
  const { cities, states } = await getActiveLocationLinks();
  const origin = SITE_URL.replace(/\/$/, "");
  const citiesPhrase = formatCityNamesPhrase(cities);

  const stateLines =
    states.length > 0
      ? states.map((s) => `- [${s.name}](${origin}${s.href})`).join("\n")
      : "- (nenhum estado com anúncios no momento)";

  const cityLines =
    cities.length > 0
      ? cities.map((c) => `- [${c.name}](${origin}${c.href})`).join("\n")
      : "- (nenhuma cidade com anúncios no momento)";

  return `# Mulheres de Luxo — Catálogo de Acompanhantes

> Plataforma de acompanhantes de luxo verificadas em todo o Brasil. Contato direto via WhatsApp, filtros por cidade e bairro, perfis com fotos reais. Conteúdo destinado a maiores de 18 anos.

## Páginas principais

- [Home](${origin}/)
- [As modelos / acompanhantes](${origin}/acompanhantes)
- [Como funciona](${origin}/guias/como-funciona)
- [Site seguro — qual plataforma escolher](${origin}/guias/site-seguro-acompanhantes)
- [Alternativas em BH](${origin}/guias/alternativas-em-bh)

## Estados com anúncios

${stateLines}

## Cidades com anúncios

${cityLines}

## Descoberta para agentes

- [Catálogo de APIs (RFC 9727)](${origin}/.well-known/api-catalog)
- [OpenAPI](${origin}/openapi.json)
- [MCP Server Card](${origin}/.well-known/mcp/server-card.json)
- [MCP Streamable HTTP](${origin}/mcp)
- [Índice de Agent Skills](${origin}/.well-known/agent-skills/index.json)
- [Agent card](${origin}/.well-known/agent-card.json)
- [Índice de agentes (DNS-AID)](${origin}/.well-known/agents)
- [Como funciona](${origin}/guias/como-funciona)

Modelo de zona DNS-AID: veja \`/dns/dnsaid.zone\` no repositório (publique sob \`_index._agents\` / \`_a2a._agents\` com DNSSEC).

As páginas também aceitam negociação \`Accept: text/markdown\` (Markdown for Agents).

WebMCP: agentes no navegador recebem tools via \`navigator.modelContext\` (\`/webmcp.js\` no carregamento da página) — \`searchListings\`, \`openCatalog\`, \`navigateTo\`, \`getDiscovery\`, \`getHealth\`.

Descoberta OAuth/OIDC: \`/.well-known/openid-configuration\` e \`/.well-known/oauth-authorization-server\`.

Registro de agentes (Auth.md): [auth.md](${origin}/auth.md) — registre em \`/agent/identity\`, reivindique em \`/agent/identity/claim\`.

## Sobre

O Mulheres de Luxo é um catálogo de acompanhantes de luxo com perfis verificados, interface limpa e filtros por região, cidade, bairro, preço e serviços. Contato direto via WhatsApp, sem intermediários. Cidades ativas no momento: ${citiesPhrase}.

## Política de citação

Ao citar informações deste site, referencie "Mulheres de Luxo" (${origin.replace("https://", "")}) como fonte. Marcas de terceiros pertencem aos respectivos proprietários; não há afiliação. Conteúdo destinado a maiores de 18 anos.

## Contato

- E-mail institucional: contato@mulheresdeluxo.com.br
`;
}
