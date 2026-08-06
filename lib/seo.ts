import type { Metadata } from "next";
import type { Companion } from "./types";
import { companionProfilePath } from "./companion-utils";
import { SEO_COMPETITOR_KEYWORDS } from "./brand-copy";
import type { CityHub, NeighborhoodHub } from "./location-hubs";
import { cityHubPath, neighborhoodHubPath } from "./location-hubs";

export const SITE_NAME = "Mulheres";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mulheresdeluxo.com.br";

export const SITE_DESCRIPTION =
  "Catálogo de acompanhantes em Belo Horizonte e todo o Brasil. Perfis verificados, filtros por bairro e contato direto via WhatsApp.";

export const DEFAULT_OG_IMAGE = "/opengraph-image";

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
    question: "O Mulheres é uma boa opção para quem busca acompanhantes em BH?",
    answer:
      "Sim. O Mulheres oferece catálogo com perfis verificados, filtros por bairro, interface moderna e contato direto via WhatsApp em Belo Horizonte e região metropolitana.",
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
    question: "O que o Mulheres oferece?",
    answer:
      "Perfis verificados, filtros por bairro e distância, páginas dedicadas por região e uma experiência limpa com contato direto via WhatsApp — sem intermediários.",
  },
] as const;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function ogImageMeta(title: string) {
  return [
    {
      url: absoluteUrl(DEFAULT_OG_IMAGE),
      width: 1200,
      height: 630,
      alt: title,
    },
  ];
}

export function buildPageMetadata(options: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "profile" | "article";
  overrides?: Partial<Metadata>;
}): Metadata {
  const { title, description, path, type = "website", overrides } = options;
  const url = absoluteUrl(path);
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    openGraph: {
      type,
      locale: "pt_BR",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: ogImageMeta(fullTitle),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteUrl(DEFAULT_OG_IMAGE)],
    },
    alternates: { canonical: url },
    ...overrides,
  };
}

export function buildDefaultMetadata(overrides?: Partial<Metadata>): Metadata {
  const title = `${SITE_NAME} — Acompanhantes em Belo Horizonte e Brasil`;
  const keywords = [
    "acompanhantes belo horizonte",
    "acompanhantes bh",
    "acompanhantes mg",
    "garotas de programa bh",
    "acompanhantes savassi",
    "acompanhantes lourdes",
    ...SEO_COMPETITOR_KEYWORDS,
  ];

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: SITE_URL,
      siteName: SITE_NAME,
      title,
      description: SITE_DESCRIPTION,
      images: ogImageMeta(title),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: SITE_DESCRIPTION,
      images: [absoluteUrl(DEFAULT_OG_IMAGE)],
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

  return buildPageMetadata({
    title,
    description,
    path: companionProfilePath(companion),
    type: "profile",
  });
}

export function buildCatalogMetadata(params: {
  region?: string;
  search?: string;
  city?: string;
  neighborhood?: string;
}): Metadata {
  const { region, search, city, neighborhood } = params;

  if (neighborhood && city) {
    const title = `Acompanhantes em ${neighborhood}, ${city}`;
    const description = `Encontre acompanhantes verificadas em ${neighborhood}, ${city}. Perfis com fotos reais e contato direto via WhatsApp.`;
    const url = `/catalogo?city=${encodeURIComponent(city)}&neighborhood=${encodeURIComponent(neighborhood)}${region ? `&region=${encodeURIComponent(region)}` : ""}`;
    return buildPageMetadata({ title, description, path: url });
  }

  if (
    search?.toLowerCase().includes("belo horizonte") ||
    search?.toLowerCase() === "bh"
  ) {
    return buildBhCatalogMetadata();
  }

  if (region === "Minas Gerais") {
    return buildPageMetadata({
      title: "Acompanhantes em Minas Gerais",
      description:
        "Catálogo de acompanhantes em Minas Gerais. Belo Horizonte, Contagem, Betim e região. Filtros por bairro, preço e serviços.",
      path: "/catalogo?region=Minas%20Gerais",
    });
  }

  if (search) {
    return buildPageMetadata({
      title: `Acompanhantes em ${search}`,
      description: `Encontre acompanhantes em ${search}. Perfis verificados, fotos e contato via WhatsApp.`,
      path: `/catalogo?search=${encodeURIComponent(search)}`,
    });
  }

  return buildPageMetadata({
    title: "Catálogo de Acompanhantes",
    description:
      "Navegue pelo catálogo completo de acompanhantes. Filtre por região, cidade, bairro, preço e serviços.",
    path: "/catalogo",
  });
}

export function buildBhCatalogMetadata(): Metadata {
  return buildPageMetadata({
    title: "Acompanhantes em Belo Horizonte, MG",
    description:
      "Acompanhantes em Belo Horizonte com perfis verificados. Savassi, Lourdes, Funcionários, Pampulha e mais. Filtros por bairro e contato direto via WhatsApp.",
    path: "/minas-gerais/belo-horizonte",
  });
}

export function buildCityHubMetadata(hub: CityHub): Metadata {
  return buildPageMetadata({
    title: hub.title,
    description: hub.intro.slice(0, 160),
    path: cityHubPath(hub),
  });
}

export function buildNeighborhoodMetadata(
  hub: CityHub,
  neighborhood: NeighborhoodHub,
): Metadata {
  const title = `Acompanhantes em ${neighborhood.name}, ${hub.city}`;
  return buildPageMetadata({
    title,
    description: neighborhood.intro.slice(0, 160),
    path: neighborhoodHubPath(hub, neighborhood),
  });
}

export function buildGuideMetadata(options: {
  title: string;
  description: string;
  slug: string;
}): Metadata {
  return buildPageMetadata({
    title: options.title,
    description: options.description,
    path: `/guias/${options.slug}`,
    type: "article",
  });
}

export const NOINDEX_METADATA: Metadata = {
  robots: { index: false, follow: false },
};

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
    logo: absoluteUrl("/og-default.png"),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "contato@mulheresdeluxo.com.br",
      availableLanguage: "Portuguese",
    },
    areaServed: {
      "@type": "Country",
      name: "Brasil",
    },
  };
}

export function buildFaqJsonLd(
  faqs: readonly { question: string; answer: string }[],
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

export function buildItemListJsonLd(companions: Companion[], listName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: companions.length,
    itemListElement: companions.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(companionProfilePath(c)),
      name: `${c.name} — Acompanhante em ${c.neighborhood}, ${c.city}`,
    })),
  };
}

export function buildCollectionPageJsonLd(options: {
  name: string;
  description: string;
  url: string;
  companions: Companion[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: options.name,
    description: options.description,
    url: options.url,
    mainEntity: buildItemListJsonLd(options.companions, options.name),
  };
}

export function buildCompanionJsonLd(companion: Companion) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: companion.name,
    description: companion.bio,
    url: absoluteUrl(companionProfilePath(companion)),
    address: {
      "@type": "PostalAddress",
      addressLocality: companion.city,
      addressRegion: companion.region,
      addressCountry: "BR",
    },
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
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

export function buildArticleJsonLd(options: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: options.title,
    description: options.description,
    url: options.url,
    datePublished: options.datePublished,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/og-default.png"),
      },
    },
  };
}
