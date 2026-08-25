# Relatório: SEO, AEO e ferramentas para LLM/IA

**Produto:** Mulheres de Luxo  
**Stack:** Next.js 16 · React 19 · Prisma  
**Escopo:** descoberta para buscadores, answer engines e agentes de IA; landings dinâmicas

---

## Veredito

O Mulheres de Luxo não trata SEO como “meta tags no layout”: trata o site como **superfície dupla** — HTML para humanos e uma camada máquina (`.well-known`, `llms.txt`, MCP, Markdown, headers `Link`) pensada para buscadores, answer engines e agentes.

As landings locais nascem dos anúncios publicados, com metadata, FAQ e schema por nível geográfico.

---

## 1. SEO clássico — base sólida e canônica

### 1.1 Metadata centralizada

Tudo passa por `lib/seo.ts`: título, description, Open Graph, Twitter, canonical e keywords.

O host de produção é normalizado para `www`, para que sitemap e canonical batam com o redirect real:

```ts
// lib/seo.ts — normalizeSiteUrl
// Produção redireciona apex → www; sitemap/canonical devem bater com o host final.
if (url.hostname === "mulheresdeluxo.com.br") {
  url.hostname = "www.mulheresdeluxo.com.br";
}
```

`buildPageMetadata` padroniza OG + Twitter + canonical em qualquer página:

```ts
export function buildPageMetadata(options: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "profile" | "article";
  ogImagePath?: string;
  overrides?: Partial<Metadata>;
}): Metadata {
  // openGraph (locale pt_BR), twitter (summary_large_image), alternates.canonical
}
```

**Exemplos de uso:**

| Página | Função |
|--------|--------|
| Hub de cidade | `buildCityHubMetadata(hub)` em `generateMetadata` |
| Hub de estado | `buildStateHubMetadata(hub)` |
| Bairro | `buildNeighborhoodMetadata(hub, neighborhood)` |
| Perfil | `buildCompanionMetadata` — OG da foto real, `type: "profile"` |

### 1.2 Sitemap vivo

`app/sitemap.ts` não lista só páginas estáticas. Inclui:

- estados com anúncios
- cidades
- bairros com ≥1 anúncio
- `/com-local`
- hubs de tipo (`/tipo/[tag]`)
- perfis (`/acompanhante/[slug]`)

Prioridades diferenciadas (ex.: cidade BH `0.95`, perfil verificado em BH `0.7`).

### 1.3 Thin content controlado

Bairro sem anúncios recebe `noindex, follow` — preserva a estrutura de links, sem indexar páginas vazias:

```tsx
// app/[estado]/[cidade]/[bairro]/page.tsx
if (neighborhoodCompanions.length === 0) {
  return {
    ...metadata,
    robots: { index: false, follow: true },
  };
}
```

### 1.4 Canonicalização de URLs

Query do catálogo vira hub permanente (301) em `next.config.ts`.

**Exemplo:**  
`/acompanhantes?city=Belo Horizonte&neighborhood=Savassi`  
→ `/minas-gerais/belo-horizonte/savassi`

Evita conteúdo duplicado entre filtro e landing.

### 1.5 Open Graph por rota

Há `opengraph-image.tsx` na home, estado, cidade e bairro — preview social alinhado à página, não genérico.

**Arquivos-chave:** `lib/seo.ts`, `app/sitemap.ts`, `app/robots.txt/route.ts`, `next.config.ts`

---

## 2. AEO — pensado para answer engines

AEO aqui = **perguntas reais + respostas citáveis + JSON-LD**.

### 2.1 FAQ como produto de conteúdo

FAQs nacionais (`buildBrFaq`) e FAQs geradas por cidade em `lib/dynamic-location-hubs.ts`:

```ts
function buildCityFaq(city: string, shortName: string, uf: string) {
  faqs.push(
    {
      question: `Onde encontrar acompanhantes em ${city}?`,
      answer: `No Mulheres de Luxo você encontra acompanhantes em ${city}...`,
    },
    {
      question: `Tem acompanhantes com local em ${city}?`,
      answer: `Sim. Vários perfis em ${city} indicam atendimento com local próprio...`,
    },
    // ...
  );
}
```

Isso alimenta schema `FAQPage` via `buildFaqJsonLd` em `lib/seo.ts`.

### 2.2 Schema em camadas

| Tipo schema.org | Onde |
|-----------------|------|
| `WebSite` + `SearchAction` | Home |
| `Organization` | Site |
| `FAQPage` | Home, hubs, guias |
| `CollectionPage` / `ItemList` | Hubs de cidade / catálogo |
| `BreadcrumbList` | Hierarquia estado → cidade → bairro |
| `Person` + `Offer` | Perfil |
| `Article` + FAQ | Guias |

### 2.3 Exemplo na landing de cidade

Três schemas de uma vez em `components/LocationHubPages.tsx`:

```tsx
<JsonLd
  data={[
    buildBreadcrumbJsonLd([/* Início → Estado → Cidade */]),
    buildCollectionPageJsonLd({
      name: hub.title,
      description: hub.intro,
      url: absoluteUrl(cityHubPath(hub)),
      companions: cityCompanions,
    }),
    buildFaqJsonLd(faqs),
  ]}
/>
```

Answer engines (Google AI Overviews, Perplexity, etc.) conseguem citar FAQ + lista de itens + trilha geográfica sem inventar a estrutura.

**Arquivos-chave:** `lib/seo.ts`, `lib/dynamic-location-hubs.ts`, `components/LocationHubPages.tsx`, `components/JsonLd.tsx`

---

## 3. Ferramentas para LLM e IAs

### 3.1 `llms.txt` dinâmico

Não é um arquivo morto em `/public`: é gerado em `lib/llms-txt.ts` com cidades/estados **ativos** + mapa de descoberta:

- Home, catálogo, guias
- Estados e cidades com anúncios
- Links para api-catalog, OpenAPI, MCP, agent-skills, agent-card
- Menção a Markdown for Agents e WebMCP
- Política de citação e contato

Rota: `app/llms.txt/route.ts` → `GET /llms.txt`

### 3.2 Content Signals no robots

Política explícita (contentsignals.org) em `app/robots.txt/route.ts`:

| Sinal | Valor | Significado |
|-------|-------|-------------|
| `search` | `yes` | Indexação clássica |
| `ai-input` | `yes` | RAG / grounding |
| `ai-train` | `no` | Sem treino de modelo |

Regras dedicadas a **GPTBot**, **ChatGPT-User**, **ClaudeBot**, **PerplexityBot**, com `Allow` em `/llms.txt`, `/.well-known/`, hubs geográficos e guias.

### 3.3 Descoberta padrão de indústria

| Endpoint | Papel |
|----------|-------|
| `/.well-known/api-catalog` | RFC 9727 linkset |
| `/openapi.json` | OpenAPI 3.1 |
| `/mcp` | MCP Streamable HTTP |
| `/.well-known/mcp/server-card.json` | MCP Server Card |
| `/.well-known/agent-card.json` | A2A / DNS-AID card |
| `/.well-known/agents` | Índice de agentes |
| `/.well-known/agent-skills/` | Skills markdown + índice |
| `/auth.md` | Registro / auth de agentes |
| `/.well-known/openid-configuration` | OIDC |
| `/.well-known/oauth-authorization-server` | OAuth AS |

Headers `Link` globais em `next.config.ts` anunciam isso em **toda** resposta HTTP — o agente não precisa adivinhar por onde começar.

### 3.4 MCP com tools reais

Em `lib/mcp-server.ts`:

| Tool | Função |
|------|--------|
| `health` | Status do serviço |
| `search_listings` | Busca por cidade, bairro ou texto |
| `get_discovery` | Links OpenAPI, catalog, Auth.md |

### 3.5 Markdown for Agents

Middleware + `lib/markdown-negotiation.ts`: com `Accept: text/markdown`, a mesma página HTML vira markdown limpo (título, description, JSON-LD preservado; nav/footer removidos).

**Uma URL, dois consumidores.**

### 3.6 WebMCP

`/webmcp.js` registra tools no browser via `navigator.modelContext`:

- `searchListings`
- `openCatalog`
- `navigateTo`
- `getDiscovery`
- `getHealth`

**Arquivos-chave:** `lib/llms-txt.ts`, `lib/mcp-server.ts`, `lib/webmcp.ts`, `lib/agent-discovery.ts`, `lib/markdown-negotiation.ts`, `app/.well-known/**`, `public/.well-known/agent-skills/**`

---

## 4. Landings dinâmicas

### 4.1 Árvore geográfica + intenções

```
/[estado]
/[estado]/[cidade]
/[estado]/[cidade]/[bairro]
/[estado]/[cidade]/com-local      ← intent comercial
/[estado]/[cidade]/tipo/[tag]     ← intent de filtro
/acompanhante/[slug]
```

**Exemplos:**

| Rota | Exemplo |
|------|---------|
| Estado | `/minas-gerais` |
| Cidade | `/minas-gerais/belo-horizonte` |
| Bairro | `/minas-gerais/belo-horizonte/savassi` |
| Com local | `/minas-gerais/belo-horizonte/com-local` |
| Tipo | `/minas-gerais/belo-horizonte/tipo/...` |
| Perfil | `/acompanhante/[slug]` |

### 4.2 Geração a partir dos dados

Não é CMS estático de dezenas de URLs fixas. O índice `buildPublishedLocationIndex(companions)` + `generateStaticParams` cria só o que existe; `revalidate = 3600` mantém ISR horário.

```tsx
// app/[estado]/[cidade]/page.tsx
export const revalidate = 3600;

export async function generateStaticParams() {
  const companions = await getPublishedCompanions().catch(() => []);
  const index = buildPublishedLocationIndex(companions);
  return allCityHubKeys(index);
}

export async function generateMetadata({ params }: PageProps) {
  const hub = resolveCityHubFromData(estado, cidade, companions);
  if (!hub) return { title: "Página não encontrada" };
  return buildCityHubMetadata(hub);
}

export default async function DynamicCityPage({ params }: PageProps) {
  // ...
  return <CityHubPage hub={hub} />;
}
```

### 4.3 Conteúdo local programático

Em `lib/dynamic-location-hubs.ts`, cada cidade ganha:

- tags SEO
- FAQ local
- paths `/com-local` e `/tipo/...`

Salvador, por exemplo, inclui perguntas com linguagem de busca real (“mulheres de programa em Salvador”).

O template `LocationHubPages` renderiza hero, breadcrumb, grade, links internos e JsonLd — **um componente, N URLs indexáveis**.

### 4.4 Sitemap acompanha a árvore

Estados → cidades → bairros (≥1 anúncio) → com-local → tipo → perfis. A prioridade reflete valor comercial (BH e hubs densos sobem).

**Arquivos-chave:** `app/[estado]/**`, `lib/dynamic-location-hubs.ts`, `lib/location-hubs.ts`, `components/LocationHubPages.tsx`

---

## 5. Por que isso se destaca

| Decisão | Efeito |
|---------|--------|
| SEO + AEO + agent surface no mesmo desenho | Buscador, AI Overview e LLM usam a mesma verdade |
| Landings = projeção dos anúncios | Escala sem thin content manual |
| `noindex` em vazio + 301 de query → hub | Evita canibalização e lixo de índice |
| `llms.txt` + Link headers + `.well-known` | Agente descobre o site como API |
| FAQ + CollectionPage + Breadcrumb | Citável por answer engines |
| MCP + Markdown Accept + WebMCP | Três canais de consumo por IA |

---

## 6. Mapa rápido de arquivos

```
lib/seo.ts                    # Metadata, JSON-LD, FAQs base
lib/llms-txt.ts               # Conteúdo dinâmico /llms.txt
lib/dynamic-location-hubs.ts  # Índice, FAQ por cidade, paths
lib/agent-discovery.ts        # Agent card / índice
lib/mcp-server.ts             # Tools MCP
lib/webmcp.ts                 # Tools no browser
lib/markdown-negotiation.ts   # Accept: text/markdown

app/sitemap.ts
app/robots.txt/route.ts
app/llms.txt/route.ts
app/[estado]/...             # Landings ISR
app/.well-known/**            # Descoberta de agentes
app/acompanhante/[slug]/     # Perfis

components/LocationHubPages.tsx
components/JsonLd.tsx
components/WebMcp.tsx

next.config.ts                # Redirects 301 + Link headers
public/.well-known/agent-skills/
public/auth.md
```

---

## Conclusão

Não se trata de “otimizar uma landing”: o projeto constrói um **sistema de descoberta** em que cada anúncio publicado amplia a malha de URLs, schemas e sinais para humanos, Google e agentes.
`)