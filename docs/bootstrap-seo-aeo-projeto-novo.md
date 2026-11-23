# Bootstrap SEO + AEO + Agent Surface

Documento para **copiar e colar em outro projeto**. Contém: prompt para a IA, arquivos para criar, playbook completo e template de rule do Cursor.

**Origem:** implementação [Mulheres de Luxo](https://github.com/) — Next.js 16, App Router.

---

## 1. Prompt para colar no Cursor (projeto novo)

Copie o bloco abaixo na primeira mensagem do chat, preenchendo os `[...]`:

```
Implemente SEO + AEO + agent surface neste projeto seguindo o playbook abaixo.

## Contexto do projeto
- Stack: [ex.: Next.js 16 App Router + Prisma]
- Domínio/site: [ex.: meusite.com.br]
- Entidade principal: [ex.: produto, profissional, imóvel]
- Hierarquia local (se houver): [ex.: estado → cidade → bairro]
- Rotas privadas (noindex): [ex.: /admin, /conta, /auth]

## Instruções
1. Leia a estrutura atual do repo antes de codar.
2. Siga as fases 0–6 deste playbook (seção 4 deste doc).
3. Centralize metadata e JSON-LD em lib/seo.ts (ou equivalente).
4. Adapte vocabulário e rotas ao domínio — NÃO copie paths do Mulheres de Luxo.
5. Crie .cursor/rules/seo-aeo.mdc conforme seção 3.
6. Ao final, marque o checklist da Fase 6 e liste o que ficou opcional/de fora.

Se existir o skill pessoal seo-aeo-playbook em ~/.cursor/skills/, use-o como guia.
Referência de implementação real: repo mulheres — lib/seo.ts, app/sitemap.ts, lib/llms-txt.ts.
```

---

## 2. Arquivos para criar no projeto novo

### 2.1 Rule do Cursor

Crie `.cursor/rules/seo-aeo.mdc` (ajuste `globs` aos paths reais do projeto):

```markdown
---
description: SEO, AEO e agent surface — seguir playbook e módulo centralizado
globs: lib/seo.ts,lib/llms-txt.ts,app/sitemap.ts,app/robots.txt/**,app/llms.txt/**,components/JsonLd.tsx,docs/bootstrap-seo-aeo-projeto-novo.md
alwaysApply: false
---

# SEO + AEO + Agent Surface

Ao editar estes arquivos, aplique o skill **seo-aeo-playbook** (`~/.cursor/skills/seo-aeo-playbook/`) ou o doc `docs/bootstrap-seo-aeo-projeto-novo.md`.

## Convenções

- Metadata, JSON-LD e FAQs passam por `lib/seo.ts` — não duplicar em páginas.
- Landings dinâmicas = projeção dos registros publicados, com ISR (`revalidate = 3600`).
- Páginas vazias: `noindex, follow`. Filtros com query → hub permanente (301).
- `llms.txt` dinâmico (route handler), não arquivo estático desatualizado.
- Schema em camadas: Breadcrumb + CollectionPage/ItemList + FAQPage nos hubs.
- Rotas privadas usam `NOINDEX_METADATA`.

## Antes de mergear

- [ ] Canonical e sitemap batem com host final de produção
- [ ] JSON-LD reflete FAQ visível no HTML
- [ ] Sitemap inclui novas rotas indexáveis
- [ ] Sem thin content indexado
```

### 2.2 Skill pessoal (mesma máquina ou copiar)

Se você usa a **mesma máquina**, o skill já existe em:

```
~/.cursor/skills/seo-aeo-playbook/
├── SKILL.md
└── reference.md
```

Para **outra máquina**, copie essa pasta inteira para `~/.cursor/skills/seo-aeo-playbook/`.

Alternativa sem skill: salve este arquivo como `docs/bootstrap-seo-aeo-projeto-novo.md` no projeto novo e referencie-o na rule.

### 2.3 Doc de referência local (opcional)

Após implementar, vale gerar `docs/relatorio-seo-aeo-llm.md` descrevendo o que foi feito **neste** projeto (mapa de arquivos, rotas, decisões).

---

## 3. Princípios (sempre)

- **Uma fonte de verdade** — metadata, FAQ e schema derivam dos mesmos dados.
- **Superfície dupla** — HTML para humanos + camada máquina (JSON-LD, llms.txt, discovery).
- **Thin content controlado** — `noindex, follow` em páginas vazias; 301 de query/filtro → hubs permanentes.
- **Landings = projeção dos dados** — URLs nascem do índice publicado.
- **Host canônico único** — sitemap, canonical e redirects batem com o host final (ex.: apex → www).

---

## 4. Fases de implementação

```
SEO/AEO Progress:
- [ ] Fase 0: Diagnóstico
- [ ] Fase 1: SEO base
- [ ] Fase 2: AEO (FAQ + schema)
- [ ] Fase 3: Landings dinâmicas (se aplicável)
- [ ] Fase 4: Agent surface (llms.txt + robots)
- [ ] Fase 5: Agent surface avançada (opcional)
- [ ] Fase 6: Verificação
```

### Fase 0 — Diagnóstico

- [ ] Páginas indexáveis vs privadas (admin, auth → `noindex`)
- [ ] Hierarquia de URLs (estático, dinâmico, filtros com query)
- [ ] Duplicatas query vs hub
- [ ] `SITE_URL` / host de produção e redirects

### Fase 1 — SEO base

Módulo central `lib/seo.ts` (ou equivalente):

- [ ] `normalizeSiteUrl` — host final de produção
- [ ] `absoluteUrl(path)`
- [ ] `buildPageMetadata({ title, description, path, type?, ogImagePath? })`
- [ ] Builders por tipo de página
- [ ] `NOINDEX_METADATA` para rotas privadas
- [ ] `app/sitemap.ts` — estáticas + dinâmicas com prioridades
- [ ] `robots.txt` — allow/disallow + URL do sitemap
- [ ] Redirects 301: filtros/query → hubs permanentes
- [ ] OG images por rota principal (recomendado)

**Padrão metadata:**

```ts
export function buildPageMetadata(options: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "profile" | "article";
  ogImagePath?: string;
  overrides?: Partial<Metadata>;
}): Metadata {
  // openGraph locale pt_BR, twitter summary_large_image, alternates.canonical
}
```

### Fase 2 — AEO

- [ ] FAQs com perguntas reais de busca (nacional + local)
- [ ] `buildFaqJsonLd(faqs)` → schema `FAQPage`
- [ ] FAQ visível no HTML (não só JSON-LD)
- [ ] Componente `<JsonLd data={[...]} />` reutilizável

| Página | Schema mínimo |
|--------|---------------|
| Home | `WebSite` + `SearchAction`, `Organization`, `FAQPage` |
| Hub/listagem | `CollectionPage` + `ItemList`, `BreadcrumbList`, `FAQPage` |
| Detalhe | tipo da entidade + `BreadcrumbList` |
| Guia/blog | `Article` + `FAQPage` |

**Exemplo hub:**

```tsx
<JsonLd
  data={[
    buildBreadcrumbJsonLd([/* Início → Região → Local */]),
    buildCollectionPageJsonLd({ name, description, url, items }),
    buildFaqJsonLd(faqs),
  ]}
/>
```

### Fase 3 — Landings dinâmicas (se aplicável)

- [ ] Índice a partir dos registros publicados
- [ ] `generateStaticParams` só para combinações que existem
- [ ] `revalidate = 3600` (ISR)
- [ ] Template único: hero, breadcrumb, lista, links internos, JsonLd
- [ ] Intents comerciais extras só quando há dados
- [ ] Sitemap inclui a árvore completa
- [ ] `noindex, follow` quando listagem vazia

**Rotas genéricas:**

```
/[região]
/[região]/[local]
/[região]/[local]/[sub-local]
/[região]/[local]/[intent]
/[entidade]/[slug]
```

**Thin content:**

```tsx
if (items.length === 0) {
  return { ...metadata, robots: { index: false, follow: true } };
}
```

### Fase 4 — Agent surface (recomendado)

- [ ] `llms.txt` **dinâmico** (route handler):
  - descrição do site, páginas principais, entidades ativas
  - links para discovery
  - política de citação e contato
- [ ] Content Signals no robots:

```
Content-Signal: ai-train=no, search=yes, ai-input=yes
```

| Sinal | Valor | Significado |
|-------|-------|-------------|
| `search` | `yes` | Indexação clássica |
| `ai-input` | `yes` | RAG / grounding |
| `ai-train` | `no` | Sem treino de modelo |

- [ ] Regras para GPTBot, ClaudeBot, PerplexityBot
- [ ] Headers `Link` globais para api-catalog / agent-card (se existirem)

### Fase 5 — Agent surface avançada (opcional)

Só se o produto expõe API ou o usuário pedir:

- [ ] `/.well-known/api-catalog` (RFC 9727)
- [ ] `/openapi.json`
- [ ] `/mcp` com tools (`health`, busca, `get_discovery`)
- [ ] `/.well-known/mcp/server-card.json`, `agent-card.json`
- [ ] `Accept: text/markdown` → mesma URL retorna markdown limpo
- [ ] WebMCP no browser — raro

### Fase 6 — Verificação

- [ ] Title, description e canonical únicos por página indexável
- [ ] Sitemap acessível; URLs = canonical
- [ ] JSON-LD válido
- [ ] Páginas vazias com `noindex`
- [ ] Redirects 301 testados
- [ ] `/llms.txt` atualizado
- [ ] `robots.txt` com Content-Signal e sitemap
- [ ] Rotas privadas com `noindex`

---

## 5. Mapa de arquivos alvo (adaptar nomes)

```
lib/seo.ts                    # Metadata, JSON-LD, FAQs base
lib/llms-txt.ts               # Conteúdo dinâmico /llms.txt
lib/dynamic-*-hubs.ts         # Índice, FAQ por local, paths (se landings)
lib/agent-discovery.ts        # Agent card (opcional)
lib/mcp-server.ts             # MCP tools (opcional)

app/sitemap.ts
app/robots.txt/route.ts
app/llms.txt/route.ts
app/[região]/...              # Landings ISR (se aplicável)
app/.well-known/**            # Discovery (opcional)

components/JsonLd.tsx
components/*Hub*.tsx          # Template de landing
components/*Seo*.tsx          # Bloco SEO da home
components/*Faq*.tsx          # FAQ da home

next.config.ts                # Redirects 301 + Link headers
docs/bootstrap-seo-aeo-projeto-novo.md
.cursor/rules/seo-aeo.mdc
```

---

## 6. Tabela de adaptação de domínio

| Referência (Mulheres de Luxo) | Seu projeto |
|-------------------------------|-------------|
| acompanhante / perfil | [sua entidade] |
| cidade / bairro | [local / categoria] |
| `/acompanhante/[slug]` | `/[entidade]/[slug]` |
| `getPublishedCompanions()` | `getPublishedRecords()` |
| `/com-local` | [intent comercial do domínio] |
| `buildCityHubMetadata` | `buildLocalHubMetadata` |

---

## 7. O que NÃO fazer

- Copiar paths ou textos do Mulheres de Luxo literalmente
- Indexar páginas sem conteúdo
- Duplicar URLs (filtro + hub sem 301)
- JSON-LD só no client
- `llms.txt` estático quando há dados dinâmicos
- MCP/OpenAPI/WebMCP sem API real

---

## 8. Pedidos úteis depois do bootstrap

- *"Implementa só Fase 1 e 2 neste repo"*
- *"Adiciona landings dinâmicas para [região/cidade]"*
- *"Gera docs/relatorio-seo-aeo-llm.md deste projeto"*
- *"Revisa se canonical e sitemap estão corretos"*

---

## 9. Referência completa (repo origem)

Se tiver acesso ao repo **mulheres**, consulte:

- `docs/relatorio-seo-aeo-llm.md` — relatório detalhado da implementação
- `lib/seo.ts` — metadata e JSON-LD
- `app/sitemap.ts` — sitemap dinâmico
- `lib/llms-txt.ts` + `app/llms.txt/route.ts` — llms.txt
- `app/robots.txt/route.ts` — Content Signals
- `components/LocationHubPages.tsx` — template de hub com schema

Skill pessoal (playbook reutilizável): `~/.cursor/skills/seo-aeo-playbook/`
