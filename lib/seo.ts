import type { Metadata } from "next";
import type { Companion } from "./types";
import { companionPhotoAlt, companionProfilePath } from "./companion-utils";
import { SEO_COMPETITOR_KEYWORDS } from "./brand-copy";
import type { CityHub, NeighborhoodHub, StateHub } from "./location-hubs";
import {
  cityHubPath,
  findCityHubBySearch,
  findNeighborhoodHubByNames,
  neighborhoodHubPath,
  stateHubPath,
} from "./location-hubs";

export const SITE_NAME = "Mulheres";

function normalizeSiteUrl(raw: string): string {
  const trimmed = raw
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/$/, "");
  try {
    const url = new URL(
      trimmed.includes("://") ? trimmed : `https://${trimmed}`,
    );
    url.protocol = "https:";
    // Produção redireciona apex → www; sitemap/canonical devem bater com o host final.
    if (url.hostname === "mulheresdeluxo.com.br") {
      url.hostname = "www.mulheresdeluxo.com.br";
    }
    return url.origin;
  } catch {
    return "https://mulheresdeluxo.com.br";
  }
}

export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mulheresdeluxo.com.br",
);

/** Descrição canônica (SEO, Open Graph, agent cards). */
export const SITE_DESCRIPTION =
  "Catálogo de acompanhantes de luxo em todo o Brasil. Perfis verificados nas principais capitais, filtros por bairro e contato direto via WhatsApp — sem intermediários.";

/** Versão curta para MCP Server Card e metadados com limite (~100 chars). */
export const SITE_DESCRIPTION_SHORT =
  "Catálogo de acompanhantes verificadas no Brasil. Filtros por cidade, bairro e contato via WhatsApp.";

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

/** FAQ da home (escopo nacional). */
export const BR_FAQ = [
  {
    question: "Onde encontrar acompanhantes de luxo no Brasil?",
    answer:
      "No Mulheres você encontra acompanhantes verificadas nas principais capitais — Belo Horizonte, São Paulo, Rio de Janeiro, Curitiba, Brasília e Salvador — com filtros por bairro e contato direto via WhatsApp.",
  },
  {
    question: "O Mulheres atende só uma cidade?",
    answer:
      "Não. O Mulheres cobre todo o Brasil, com páginas por estado e capital. Belo Horizonte foi o primeiro hub e continua com o maior volume de bairros indexados.",
  },
  {
    question: "Como filtrar por cidade ou bairro?",
    answer:
      "Use o catálogo ou as páginas de estado e capital. Em BH você também encontra hubs por bairro (Savassi, Lourdes, Funcionários e mais).",
  },
  {
    question: "Como entrar em contato com uma acompanhante?",
    answer:
      "Cada perfil exibe WhatsApp e telefone para contato direto. Perfis verificados passam por checagem de identidade. Combine valores, horários e local antes do encontro.",
  },
  {
    question: "O Mulheres é seguro?",
    answer:
      "Sim. Perfis verificados passam por checagem de identidade, fotos reais e contato direto via WhatsApp — sem intermediários. Combine valores, horários e local antes do encontro. Conteúdo destinado a maiores de 18 anos.",
  },
  {
    question: "Tem acompanhantes com local?",
    answer:
      "Sim. Vários perfis indicam atendimento com local próprio, além de hotel, motel e deslocamento. Use os filtros do catálogo por cidade e bairro para encontrar a opção ideal.",
  },
  {
    question: "O que diferencia o Mulheres?",
    answer:
      "Perfis verificados, filtros por região, cidade e bairro, páginas locais para SEO e contato direto via WhatsApp — sem intermediários. Conteúdo destinado a maiores de 18 anos.",
  },
] as const;

/** FAQ legado BH — mantido para guias e redirects; hubs de cidade usam hub.faq. */
export const BH_FAQ = [
  {
    question: "Onde encontrar acompanhantes de luxo em Belo Horizonte?",
    answer:
      "No Mulheres você encontra acompanhantes em Belo Horizonte com perfis verificados, fotos reais e contato direto via WhatsApp. Filtre por bairro como Savassi, Lourdes, Funcionários e Pampulha.",
  },
  {
    question: "O Mulheres é uma boa opção para quem busca acompanhantes em BH?",
    answer:
      "Sim. O Mulheres oferece curadoria com perfis verificados, filtros por bairro, experiência discreta e contato direto via WhatsApp em Belo Horizonte e região metropolitana.",
  },
  {
    question: "Quais bairros de Belo Horizonte têm acompanhantes no catálogo?",
    answer:
      "Temos acompanhantes nos principais bairros de BH: Savassi, Lourdes, Funcionários, Centro, Pampulha, Buritis, Santa Efigênia, Sion e Cidade Nova. Use os filtros do catálogo para refinar por bairro.",
  },
  {
    question: "Como entrar em contato com uma acompanhante em BH?",
    answer:
      "Cada perfil exibe WhatsApp e telefone para contato direto. Perfis verificados passam por checagem de identidade. Converse antes sobre valores, horários e local de atendimento.",
  },
  {
    question: "Acompanhantes em BH atendem em hotel ou motel?",
    answer:
      "Sim. Muitas acompanhantes em Belo Horizonte atendem em hotel, motel, eventos ou com deslocamento. Cada perfil indica os locais de atendimento disponíveis.",
  },
  {
    question: "O que diferencia o Mulheres?",
    answer:
      "Perfis verificados, filtros por bairro e distância, páginas por região e contato direto via WhatsApp — sem intermediários e sem taxas ocultas. Conteúdo destinado a maiores de 18 anos.",
  },
] as const;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function trimMetaDescription(text: string, max = 160): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}

function ogImageMeta(title: string, imagePath = DEFAULT_OG_IMAGE) {
  return [
    {
      url: absoluteUrl(imagePath),
      width: 1200,
      height: 630,
      alt: title,
    },
  ];
}

function routeOgImagePath(pagePath: string): string {
  return `${pagePath}/opengraph-image`;
}

export function buildPageMetadata(options: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "profile" | "article";
  ogImagePath?: string;
  overrides?: Partial<Metadata>;
}): Metadata {
  const { title, description, path, type = "website", ogImagePath, overrides } =
    options;
  const url = absoluteUrl(path);
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME}`;
  const imagePath = ogImagePath ?? DEFAULT_OG_IMAGE;

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
      images: ogImageMeta(fullTitle, imagePath),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteUrl(imagePath)],
    },
    alternates: { canonical: url },
    ...overrides,
  };
}

export function buildDefaultMetadata(overrides?: Partial<Metadata>): Metadata {
  const title = `${SITE_NAME} — Acompanhantes de luxo em todo o Brasil`;
  const keywords = [
    "acompanhantes brasil",
    "acompanhantes de luxo",
    "acompanhantes verificadas",
    "acompanhantes belo horizonte",
    "acompanhantes são paulo",
    "acompanhantes rio de janeiro",
    "acompanhantes curitiba",
    "acompanhantes brasília",
    "acompanhantes salvador",
    "acompanhantes bh",
    "acompanhantes sp",
    "acompanhantes rj",
    "garotas de programa",
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
  const description = trimMetaDescription(
    `${companion.name}, ${companion.age} anos, acompanhante em ${companion.neighborhood}, ${companion.city} — ${companion.region}. A partir de R$ ${companion.pricePerHour}/hora. ${companion.bio}`,
  );
  const keywords = [
    `acompanhante ${companion.name.toLowerCase()}`,
    `acompanhante ${companion.city.toLowerCase()}`,
    `acompanhante ${companion.neighborhood.toLowerCase()}`,
    `acompanhantes ${companion.city.toLowerCase()}`,
    `acompanhantes ${companion.region.toLowerCase()}`,
  ];
  const photo = companion.coverPhoto || companion.photos[0];
  const imageAlt = companionPhotoAlt(companion);
  const metadata = buildPageMetadata({
    title,
    description,
    path: companionProfilePath(companion),
    type: "profile",
    overrides: {
      keywords,
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
    },
  });

  if (!photo) return metadata;

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      images: [{ url: photo, alt: imageAlt }],
    },
    twitter: {
      ...metadata.twitter,
      images: [photo],
    },
  };
}

export function buildCatalogMetadata(params: {
  region?: string;
  search?: string;
  city?: string;
  neighborhood?: string;
}): Metadata {
  const { region, search, city, neighborhood } = params;

  if (neighborhood && city) {
    const hubMatch = findNeighborhoodHubByNames(city, neighborhood);
    if (hubMatch) {
      const { hub, neighborhood: n } = hubMatch;
      const shortCity = hub.shortName;
      const path = neighborhoodHubPath(hub, n);
      const title = `Acompanhantes em ${n.name}, ${shortCity} — Verificadas`;
      const description = trimMetaDescription(
        `Acompanhantes em ${n.name}, ${shortCity} com local, perfis verificados e WhatsApp direto. Sem intermediários.`,
      );
      return buildPageMetadata({
        title,
        description,
        path,
        ogImagePath: routeOgImagePath(path),
      });
    }

    const title = `Acompanhantes em ${neighborhood}, ${city}`;
    const description = trimMetaDescription(
      `Encontre acompanhantes verificadas em ${neighborhood}, ${city}. Perfis com fotos reais, com local e contato direto via WhatsApp.`,
    );
    const url = `/acompanhantes?city=${encodeURIComponent(city)}&neighborhood=${encodeURIComponent(neighborhood)}${region ? `&region=${encodeURIComponent(region)}` : ""}`;
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
        "Catálogo de acompanhantes em Minas Gerais — Belo Horizonte, Contagem, Betim e região. Filtre por bairro, preço e serviços.",
      path: "/acompanhantes?region=Minas%20Gerais",
    });
  }

  if (region === "São Paulo") {
    return buildPageMetadata({
      title: "Acompanhantes em São Paulo",
      description:
        "Catálogo de acompanhantes em São Paulo — capital e estado. Filtre por bairro, preço e serviços.",
      path: "/acompanhantes?region=S%C3%A3o%20Paulo",
    });
  }

  if (region === "Rio de Janeiro") {
    return buildPageMetadata({
      title: "Acompanhantes no Rio de Janeiro",
      description:
        "Catálogo de acompanhantes no Rio de Janeiro — Copacabana, Barra e região. Filtre por bairro, preço e serviços.",
      path: "/acompanhantes?region=Rio%20de%20Janeiro",
    });
  }

  if (region) {
    return buildPageMetadata({
      title: `Acompanhantes em ${region}`,
      description: `Catálogo de acompanhantes em ${region}. Perfis verificados, filtros por cidade e bairro, contato via WhatsApp.`,
      path: `/acompanhantes?region=${encodeURIComponent(region)}`,
    });
  }

  if (search) {
    const cityHub = findCityHubBySearch(search);
    if (cityHub) {
      const path = cityHubPath(cityHub);
      return buildPageMetadata({
        title: cityHub.title,
        description: trimMetaDescription(cityHub.intro),
        path,
        ogImagePath: routeOgImagePath(path),
      });
    }

    return buildPageMetadata({
      title: `Acompanhantes em ${search}`,
      description: `Encontre acompanhantes em ${search}. Perfis verificados, fotos reais e contato via WhatsApp.`,
      path: `/acompanhantes?search=${encodeURIComponent(search)}`,
    });
  }

  return buildPageMetadata({
    title: "As modelos e acompanhantes",
    description:
      "Explore todas as modelos de luxo. Filtre por região, cidade, bairro, preço e serviços.",
    path: "/acompanhantes",
  });
}

export function buildBhCatalogMetadata(): Metadata {
  const path = "/minas-gerais/belo-horizonte";
  return buildPageMetadata({
    title: "Acompanhantes em Belo Horizonte, MG",
    description:
      "Acompanhantes de luxo em Belo Horizonte com perfis verificados. Savassi, Lourdes, Funcionários, Pampulha e mais. Contato direto via WhatsApp.",
    path,
    ogImagePath: routeOgImagePath(path),
  });
}

export function buildCityHubMetadata(hub: CityHub): Metadata {
  const path = cityHubPath(hub);
  const keywords = [...hub.tags];
  return buildPageMetadata({
    title: hub.title,
    description: trimMetaDescription(hub.intro),
    path,
    ogImagePath: routeOgImagePath(path),
    overrides: { keywords },
  });
}

export function buildStateHubMetadata(hub: StateHub): Metadata {
  const path = stateHubPath(hub);
  const keywords = [...hub.tags];
  return buildPageMetadata({
    title: hub.title,
    description: trimMetaDescription(hub.intro),
    path,
    ogImagePath: routeOgImagePath(path),
    overrides: { keywords },
  });
}

export function buildNeighborhoodMetadata(
  hub: CityHub,
  neighborhood: NeighborhoodHub,
): Metadata {
  const shortCity = hub.shortName;
  const path = neighborhoodHubPath(hub, neighborhood);
  const title = `Acompanhantes em ${neighborhood.name}, ${shortCity} — Verificadas`;
  const description = trimMetaDescription(
    `Acompanhantes em ${neighborhood.name}, ${shortCity} com local, perfis verificados e WhatsApp direto. Sem intermediários.`,
  );
  return buildPageMetadata({
    title,
    description,
    path,
    ogImagePath: routeOgImagePath(path),
    overrides: {
      keywords: [
        `acompanhantes ${neighborhood.name.toLowerCase()}`,
        `acompanhantes ${neighborhood.name.toLowerCase()} ${shortCity.toLowerCase()}`,
        `acompanhantes ${hub.city.toLowerCase()}`,
        `acompanhante ${neighborhood.name.toLowerCase()} bh`,
        ...hub.tags.slice(0, 3),
      ],
    },
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
        urlTemplate: `${SITE_URL}/acompanhantes?search={search_term_string}`,
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
      contactType: "customer service",
      email: "contato@mulheresdeluxo.com.br",
      availableLanguage: ["pt-BR", "Portuguese"],
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
  const profileUrl = absoluteUrl(companionProfilePath(companion));
  const photos =
    companion.photos.length > 0
      ? companion.photos
      : companion.coverPhoto
        ? [companion.coverPhoto]
        : [];

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": profileUrl,
    name: companion.name,
    description: companion.bio,
    url: profileUrl,
    jobTitle: "Acompanhante",
    gender: companion.gender || "Mulher",
    ...(photos.length > 0 ? { image: photos } : {}),
    address: {
      "@type": "PostalAddress",
      ...(companion.neighborhood
        ? { streetAddress: companion.neighborhood }
        : {}),
      addressLocality: companion.city,
      addressRegion: companion.region,
      addressCountry: "BR",
    },
    ...(companion.pricePerHour > 0
      ? {
          makesOffer: {
            "@type": "Offer",
            price: companion.pricePerHour,
            priceCurrency: "BRL",
            unitText: "HOUR",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
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
