import type { Metadata } from "next";
import type { Companion } from "./types";

export const SITE_NAME = "Mulheres";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mulheres.com.br";

export const SITE_DESCRIPTION =
  "Catálogo de acompanhantes em Belo Horizonte e todo o Brasil. Perfis verificados, filtros por bairro e contato direto via WhatsApp.";

/** Termos que o público usa ao buscar — inclui concorrentes para capturar tráfego orgânico */
export const SEARCH_ALTERNATIVES = [
  "Fatal Model",
  "Garota com Local",
  "Photoacompanhante",
  "Skokka",
] as const;

export const BH_NEIGHBORHOODS = [
  "Savassi",
  "Lourdes",
  "Funcionários",
  "Centro",
  "Pampulha",
  "Buritis",
  "Santa Efigênia",
  "Sion",
  "Cidade Nova",
  "Barro Preto",
] as const;

export const BH_FAQ = [
  {
    question: "Onde encontrar acompanhantes em Belo Horizonte?",
    answer:
      "No Mulheres você encontra acompanhantes em Belo Horizonte com perfis verificados, fotos reais e contato direto via WhatsApp. Filtre por bairro como Savassi, Lourdes, Funcionários e Pampulha.",
  },
  {
    question: "O Mulheres é alternativa ao Fatal Model em BH?",
    answer:
      "Sim. Se você costuma buscar no Fatal Model, Garota com Local, Photoacompanhante ou Skokka, o Mulheres oferece a mesma praticidade com interface moderna, filtros avançados e perfis verificados em Belo Horizonte e região metropolitana.",
  },
  {
    question: "Quais bairros de Belo Horizonte têm acompanhantes no catálogo?",
    answer:
      "Temos acompanhantes nos principais bairros de BH: Savassi, Lourdes, Funcionários, Centro, Pampulha, Buritis, Santa Efigênia, Sion e Cidade Nova. Use os filtros do catálogo para refinar por bairro.",
  },
  {
    question: "Como entrar em contato com uma acompanhante em BH?",
    answer:
      "Cada perfil exibe WhatsApp e telefone para contato direto. Perfis verificados passam por checagem de identidade. Recomendamos conversar antes sobre valores, horários e local de atendimento.",
  },
  {
    question: "Acompanhantes em BH atendem em hotel ou motel?",
    answer:
      "Sim. Muitas acompanhantes em Belo Horizonte atendem em hotel, motel, eventos ou deslocamento. Cada perfil indica os locais de atendimento disponíveis.",
  },
  {
    question: "Qual a diferença entre Mulheres e sites como Skokka ou Photoacompanhante?",
    answer:
      "O Mulheres prioriza perfis verificados, filtros por bairro e distância, e uma experiência limpa sem anúncios invasivos. Funciona como alternativa moderna ao Fatal Model, Garota com Local, Photoacompanhante e Skokka para quem busca acompanhantes em Belo Horizonte.",
  },
] as const;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildDefaultMetadata(overrides?: Partial<Metadata>): Metadata {
  const title = `${SITE_NAME} — Acompanhantes em Belo Horizonte e Brasil`;
  const description = SITE_DESCRIPTION;
  const keywords = [
    "acompanhantes belo horizonte",
    "acompanhantes bh",
    "acompanhantes mg",
    "garotas de programa bh",
    "acompanhantes savassi",
    "acompanhantes lourdes",
    ...SEARCH_ALTERNATIVES.map((s) => s.toLowerCase()),
    "fatal model bh",
    "garota com local bh",
    "photoacompanhante bh",
    "skokka bh",
  ];

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: SITE_URL,
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: SITE_URL,
    },
    ...overrides,
  };
}

export function buildCompanionMetadata(companion: Companion): Metadata {
  const title = `${companion.name}, ${companion.age} — Acompanhante em ${companion.city}`;
  const description = `${companion.name}, ${companion.age} anos, acompanhante em ${companion.neighborhood}, ${companion.city} - ${companion.region}. R$ ${companion.pricePerHour}/hora. ${companion.bio.slice(0, 120)}`;
  const url = absoluteUrl(`/acompanhante/${companion.id}`);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "profile",
    },
    alternates: { canonical: url },
  };
}

export function buildCatalogMetadata(params: {
  region?: string;
  search?: string;
}): Metadata {
  const { region, search } = params;

  if (search?.toLowerCase().includes("belo horizonte") || search?.toLowerCase() === "bh") {
    return buildBhCatalogMetadata();
  }

  if (region === "Minas Gerais") {
    const title = "Acompanhantes em Minas Gerais";
    const description =
      "Catálogo de acompanhantes em Minas Gerais. Belo Horizonte, Contagem, Betim e região. Filtros por bairro, preço e serviços.";
    const url = absoluteUrl("/catalogo?region=Minas%20Gerais");
    return { title, description, alternates: { canonical: url } };
  }

  if (search) {
    const title = `Acompanhantes em ${search}`;
    const description = `Encontre acompanhantes em ${search}. Perfis verificados, fotos e contato via WhatsApp.`;
    const url = absoluteUrl(`/catalogo?search=${encodeURIComponent(search)}`);
    return { title, description, alternates: { canonical: url } };
  }

  return {
    title: "Catálogo de Acompanhantes",
    description:
      "Navegue pelo catálogo completo de acompanhantes. Filtre por região, cidade, bairro, preço e serviços.",
    alternates: { canonical: absoluteUrl("/catalogo") },
  };
}

export function buildBhCatalogMetadata(): Metadata {
  const title = "Acompanhantes em Belo Horizonte, MG";
  const description =
    "Acompanhantes em Belo Horizonte com perfis verificados. Savassi, Lourdes, Funcionários, Pampulha e mais. Alternativa ao Fatal Model, Garota com Local, Photoacompanhante e Skokka.";
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl("/minas-gerais/belo-horizonte") },
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "pt-BR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/catalogo?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    areaServed: {
      "@type": "City",
      name: "Belo Horizonte",
      containedInPlace: {
        "@type": "State",
        name: "Minas Gerais",
      },
    },
  };
}

export function buildFaqJsonLd(
  faqs: readonly { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildItemListJsonLd(
  companions: Companion[],
  listName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: companions.length,
    itemListElement: companions.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/acompanhante/${c.id}`),
      name: `${c.name} — Acompanhante em ${c.neighborhood}, ${c.city}`,
    })),
  };
}

export function buildCompanionJsonLd(companion: Companion) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: companion.name,
    description: companion.bio,
    url: absoluteUrl(`/acompanhante/${companion.id}`),
    address: {
      "@type": "PostalAddress",
      addressLocality: companion.city,
      addressRegion: companion.region,
      addressCountry: "BR",
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
