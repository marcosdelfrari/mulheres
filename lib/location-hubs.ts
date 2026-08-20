import type { Companion, Region } from "./types";
import { slugify } from "./slug";

export interface NeighborhoodHub {
  slug: string;
  name: string;
  intro: string;
  faq: readonly { question: string; answer: string }[];
}

export interface CityHub {
  stateSlug: string;
  citySlug: string;
  city: string;
  region: Region;
  /** Sigla ou apelido curto (ex.: BH, SP) */
  shortName: string;
  title: string;
  eyebrow: string;
  /** Trecho do H1 após "luxo em" */
  heroLocation: string;
  heroSub: string;
  intro: string;
  seoHeading: string;
  whySection: string;
  /** Tags / âncoras internas para SEO e navegação */
  tags: readonly string[];
  faq: readonly { question: string; answer: string }[];
  neighborhoods: NeighborhoodHub[];
}

export interface StateHub {
  stateSlug: string;
  region: Region;
  uf: string;
  title: string;
  eyebrow: string;
  heroLocation: string;
  heroSub: string;
  intro: string;
  seoHeading: string;
  whySection: string;
  tags: readonly string[];
  faq: readonly { question: string; answer: string }[];
  /** citySlug da capital (hub em CITY_HUBS) */
  capitalCitySlug: string;
}

const ALTERNATIVES_TEXT =
  "outros classificados e diretórios de acompanhantes";

export const BH_NEIGHBORHOOD_HUBS: NeighborhoodHub[] = [
  {
    slug: "savassi",
    name: "Savassi",
    intro:
      "O Savassi concentra bares, restaurantes e vida noturna — um dos bairros com maior demanda por acompanhantes em Belo Horizonte. No Mulheres você encontra perfis verificados com contato direto via WhatsApp.",
    faq: [
      {
        question: "Onde encontrar acompanhantes no Savassi, BH?",
        answer:
          "No Mulheres você encontra acompanhantes no Savassi com perfis verificados, fotos reais e contato direto via WhatsApp. Filtre por preço, serviços e disponibilidade.",
      },
      {
        question: "Acompanhantes do Savassi atendem em hotel?",
        answer:
          "Sim. Várias acompanhantes no Savassi atendem em hotel, motel e deslocamento. Cada perfil indica os locais de atendimento disponíveis.",
      },
    ],
  },
  {
    slug: "lourdes",
    name: "Lourdes",
    intro:
      "Lourdes é um bairro tradicional e sofisticado de BH, ideal para encontros discretos e eventos. Confira acompanhantes verificadas no Mulheres com atendimento no bairro e região.",
    faq: [
      {
        question: "Tem acompanhantes no Lourdes, Belo Horizonte?",
        answer:
          "Sim. O Mulheres lista acompanhantes no Lourdes com perfis verificados, preços transparentes e contato direto via WhatsApp.",
      },
    ],
  },
  {
    slug: "funcionarios",
    name: "Funcionários",
    intro:
      "Funcionários reúne perfis discretos e elegantes para jantares, encontros reservados e eventos corporativos em Belo Horizonte.",
    faq: [
      {
        question: "Como encontrar acompanhantes no Funcionários?",
        answer:
          "Acesse o catálogo do Mulheres filtrado por Funcionários. Perfis verificados com fotos, serviços e WhatsApp para contato imediato.",
      },
    ],
  },
  {
    slug: "centro",
    name: "Centro",
    intro:
      "O Centro de BH concentra profissionais experientes para eventos corporativos, viagens e encontros no coração da capital mineira.",
    faq: [
      {
        question: "Acompanhantes no Centro de BH — como funciona?",
        answer:
          "No Mulheres você navega por acompanhantes no Centro de Belo Horizonte, compara preços e entra em contato direto via WhatsApp, sem intermediários.",
      },
    ],
  },
  {
    slug: "pampulha",
    name: "Pampulha",
    intro:
      "A região da Pampulha oferece acompanhantes com flexibilidade de horários e atendimento em diversos locais de Belo Horizonte.",
    faq: [
      {
        question: "Há acompanhantes na Pampulha?",
        answer:
          "Sim. O Mulheres lista acompanhantes na Pampulha e entorno com perfis verificados e contato direto via WhatsApp.",
      },
    ],
  },
  {
    slug: "buritis",
    name: "Buritis",
    intro:
      "Buritis é uma região residencial de BH com demanda crescente. Encontre acompanhantes verificadas com filtros por preço e serviços.",
    faq: [
      {
        question: "Onde achar acompanhantes no Buritis?",
        answer:
          "No catálogo Mulheres, filtre por Buritis em Belo Horizonte. Perfis com fotos reais e contato via WhatsApp.",
      },
    ],
  },
];

export const CITY_HUBS: CityHub[] = [
  {
    stateSlug: "minas-gerais",
    citySlug: "belo-horizonte",
    city: "Belo Horizonte",
    region: "Minas Gerais",
    shortName: "BH",
    title: "Acompanhantes em Belo Horizonte, MG",
    eyebrow: "Exclusividade em Minas Gerais",
    heroLocation: "Belo Horizonte",
    heroSub:
      "Descubra perfis selecionados na capital mineira e região. Uma curadoria focada em discrição, sofisticação e atendimento de alto nível.",
    intro: `Encontre acompanhantes de luxo em BH com perfis verificados, fotos reais e contato direto via WhatsApp. Para quem já usa ${ALTERNATIVES_TEXT}, o Mulheres oferece filtros por bairro, distância e serviços.`,
    seoHeading: "Acompanhantes de luxo em Belo Horizonte — MG",
    whySection:
      "Belo Horizonte concentra milhares de buscas por acompanhantes todos os meses. O Mulheres reúne perfis verificados, interface rápida e filtros precisos por bairros como Savassi, Lourdes e Funcionários — com contato direto via WhatsApp.",
    tags: [
      "acompanhantes belo horizonte",
      "acompanhantes bh",
      "acompanhantes savassi",
      "acompanhantes lourdes",
      "acompanhantes funcionários",
      "acompanhantes pampulha",
      "acompanhantes de luxo mg",
    ],
    faq: [
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
        question: "O que diferencia o Mulheres em Belo Horizonte?",
        answer:
          "Perfis verificados, filtros por bairro e distância, páginas por região e contato direto via WhatsApp — sem intermediários e sem taxas ocultas. Conteúdo destinado a maiores de 18 anos.",
      },
    ],
    neighborhoods: BH_NEIGHBORHOOD_HUBS,
  },
  {
    stateSlug: "sao-paulo",
    citySlug: "sao-paulo",
    city: "São Paulo",
    region: "São Paulo",
    shortName: "São Paulo",
    title: "Acompanhantes em São Paulo, SP",
    eyebrow: "Exclusividade em São Paulo",
    heroLocation: "São Paulo",
    heroSub:
      "Descubra perfis selecionados na capital paulista. Curadoria focada em discrição, sofisticação e atendimento de alto nível.",
    intro: `Catálogo de acompanhantes em São Paulo com perfis verificados. Pinheiros, Moema, Vila Madalena e toda a capital paulista. Contato direto via WhatsApp. Para quem já usa ${ALTERNATIVES_TEXT}, o Mulheres oferece filtros precisos e experiência moderna.`,
    seoHeading: "Acompanhantes de luxo em São Paulo — SP",
    whySection:
      "São Paulo é o maior mercado de buscas por acompanhantes no Brasil. O Mulheres reúne perfis verificados, filtros por bairro e contato direto via WhatsApp — sem intermediários.",
    tags: [
      "acompanhantes são paulo",
      "acompanhantes sp",
      "acompanhantes pinheiros",
      "acompanhantes moema",
      "acompanhantes vila madalena",
      "acompanhantes de luxo sp",
    ],
    faq: [
      {
        question: "Onde encontrar acompanhantes em São Paulo?",
        answer:
          "No Mulheres você encontra acompanhantes em São Paulo com perfis verificados, filtros por bairro e contato direto via WhatsApp.",
      },
      {
        question: "Quais regiões de SP têm acompanhantes no Mulheres?",
        answer:
          "Pinheiros, Moema, Vila Madalena, Jardins e outras regiões da capital. Use os filtros do catálogo para refinar por bairro.",
      },
      {
        question: "Como funciona o contato com acompanhantes em SP?",
        answer:
          "Cada perfil exibe WhatsApp para contato direto. Perfis verificados passam por checagem. Combine valores, horários e local antes do encontro.",
      },
    ],
    neighborhoods: [],
  },
  {
    stateSlug: "rio-de-janeiro",
    citySlug: "rio-de-janeiro",
    city: "Rio de Janeiro",
    region: "Rio de Janeiro",
    shortName: "Rio",
    title: "Acompanhantes no Rio de Janeiro, RJ",
    eyebrow: "Exclusividade no Rio de Janeiro",
    heroLocation: "Rio de Janeiro",
    heroSub:
      "Perfis selecionados na Cidade Maravilhosa — Copacabana, Barra e Zona Sul. Discrição, sofisticação e atendimento de alto nível.",
    intro: `Acompanhantes no Rio de Janeiro — Copacabana, Barra da Tijuca e Zona Sul. Perfis verificados com fotos e contato direto. Alternativa moderna a ${ALTERNATIVES_TEXT}.`,
    seoHeading: "Acompanhantes de luxo no Rio de Janeiro — RJ",
    whySection:
      "O Rio concentra alta demanda por acompanhantes em Copacabana, Ipanema, Barra e Zona Sul. O Mulheres oferece perfis verificados e contato direto via WhatsApp.",
    tags: [
      "acompanhantes rio de janeiro",
      "acompanhantes rj",
      "acompanhantes copacabana",
      "acompanhantes barra da tijuca",
      "acompanhantes zona sul",
      "acompanhantes de luxo rj",
    ],
    faq: [
      {
        question: "Como encontrar acompanhantes no Rio de Janeiro?",
        answer:
          "Navegue pelo catálogo Mulheres filtrado para o Rio de Janeiro. Perfis verificados com preços, serviços e WhatsApp.",
      },
      {
        question: "Quais bairros do RJ têm acompanhantes?",
        answer:
          "Copacabana, Barra da Tijuca, Ipanema, Leblon e outras regiões. Use os filtros do catálogo para refinar a busca.",
      },
    ],
    neighborhoods: [],
  },
  {
    stateSlug: "parana",
    citySlug: "curitiba",
    city: "Curitiba",
    region: "Paraná",
    shortName: "Curitiba",
    title: "Acompanhantes em Curitiba, PR",
    eyebrow: "Exclusividade no Paraná",
    heroLocation: "Curitiba",
    heroSub:
      "Perfis selecionados no Batel e região. Curadoria focada em discrição, sofisticação e atendimento de alto nível.",
    intro: `Acompanhantes em Curitiba com atendimento sofisticado no Batel e região. Perfis verificados no Mulheres, com contato direto via WhatsApp.`,
    seoHeading: "Acompanhantes de luxo em Curitiba — PR",
    whySection:
      "Curitiba busca discrição e qualidade. O Mulheres reúne acompanhantes verificadas com filtros claros e contato direto — sem intermediários.",
    tags: [
      "acompanhantes curitiba",
      "acompanhantes pr",
      "acompanhantes batel",
      "acompanhantes de luxo curitiba",
    ],
    faq: [
      {
        question: "Tem acompanhantes em Curitiba no Mulheres?",
        answer:
          "Sim. O Mulheres lista acompanhantes em Curitiba com perfis verificados e contato direto via WhatsApp.",
      },
      {
        question: "Como filtrar acompanhantes em Curitiba?",
        answer:
          "Use o catálogo com filtro por Paraná e Curitiba. Compare preços, serviços e disponibilidade antes de entrar em contato.",
      },
    ],
    neighborhoods: [],
  },
  {
    stateSlug: "distrito-federal",
    citySlug: "brasilia",
    city: "Brasília",
    region: "Distrito Federal",
    shortName: "Brasília",
    title: "Acompanhantes em Brasília, DF",
    eyebrow: "Exclusividade no Distrito Federal",
    heroLocation: "Brasília",
    heroSub:
      "Perfis para eventos corporativos e encontros discretos na capital federal. Sofisticação e atendimento de alto nível.",
    intro:
      "Acompanhantes em Brasília para eventos corporativos e encontros discretos. Asa Sul e região administrativa, com perfis verificados e WhatsApp direto.",
    seoHeading: "Acompanhantes de luxo em Brasília — DF",
    whySection:
      "Brasília concentra demanda corporativa e encontros discretos. O Mulheres oferece perfis verificados, filtros por região e contato direto via WhatsApp.",
    tags: [
      "acompanhantes brasília",
      "acompanhantes df",
      "acompanhantes asa sul",
      "acompanhantes de luxo brasília",
    ],
    faq: [
      {
        question: "Onde encontrar acompanhantes em Brasília?",
        answer:
          "No Mulheres você encontra acompanhantes em Brasília com perfis verificados e contato direto via WhatsApp.",
      },
      {
        question: "Acompanhantes em Brasília atendem eventos?",
        answer:
          "Sim. Vários perfis indicam disponibilidade para eventos, jantares e deslocamento. Confira cada anúncio antes de combinar.",
      },
    ],
    neighborhoods: [],
  },
  {
    stateSlug: "bahia",
    citySlug: "salvador",
    city: "Salvador",
    region: "Bahia",
    shortName: "Salvador",
    title: "Acompanhantes em Salvador, BA",
    eyebrow: "Exclusividade na Bahia",
    heroLocation: "Salvador",
    heroSub:
      "Perfis com charme baiano na Barra e região metropolitana. Discrição, sofisticação e atendimento de alto nível.",
    intro:
      "Acompanhantes em Salvador com charme baiano. Barra e região metropolitana com perfis verificados e contato direto via WhatsApp.",
    seoHeading: "Acompanhantes de luxo em Salvador — BA",
    whySection:
      "Salvador une turismo e vida noturna com alta busca por acompanhantes. O Mulheres lista perfis verificados com filtros claros e WhatsApp direto.",
    tags: [
      "acompanhantes salvador",
      "acompanhantes ba",
      "acompanhantes barra salvador",
      "acompanhantes de luxo salvador",
    ],
    faq: [
      {
        question: "Como encontrar acompanhantes em Salvador?",
        answer:
          "Acesse o catálogo Mulheres para Salvador. Perfis com fotos, preços e WhatsApp para contato direto.",
      },
      {
        question: "Há acompanhantes na Barra, Salvador?",
        answer:
          "Sim. Use os filtros do catálogo por cidade e bairro para encontrar perfis na Barra e outras regiões de Salvador.",
      },
    ],
    neighborhoods: [],
  },
];

export const STATE_HUBS: StateHub[] = [
  {
    stateSlug: "minas-gerais",
    region: "Minas Gerais",
    uf: "MG",
    title: "Acompanhantes em Minas Gerais",
    eyebrow: "Exclusividade em Minas Gerais",
    heroLocation: "Minas Gerais",
    heroSub:
      "Da capital mineira ao interior — perfis verificados com discrição, sofisticação e contato direto via WhatsApp.",
    intro: `Catálogo de acompanhantes em Minas Gerais — Belo Horizonte, Contagem, Betim e região. Perfis verificados, filtros por cidade e bairro. Para quem já usa ${ALTERNATIVES_TEXT}, o Mulheres é a opção moderna.`,
    seoHeading: "Acompanhantes de luxo em Minas Gerais — MG",
    whySection:
      "Minas Gerais concentra milhares de buscas mensais, com BH como principal hub. O Mulheres organiza capitais e cidades com perfis verificados e filtros precisos.",
    tags: [
      "acompanhantes minas gerais",
      "acompanhantes mg",
      "acompanhantes belo horizonte",
      "acompanhantes bh",
    ],
    capitalCitySlug: "belo-horizonte",
    faq: [
      {
        question: "Onde encontrar acompanhantes em Minas Gerais?",
        answer:
          "No Mulheres você encontra acompanhantes em Minas Gerais com foco em Belo Horizonte e região. Perfis verificados e contato via WhatsApp.",
      },
      {
        question: "Qual a principal cidade de MG no Mulheres?",
        answer:
          "Belo Horizonte é o hub principal, com páginas por bairro (Savassi, Lourdes, Funcionários e mais). Outras cidades aparecem no catálogo conforme os anúncios.",
      },
    ],
  },
  {
    stateSlug: "sao-paulo",
    region: "São Paulo",
    uf: "SP",
    title: "Acompanhantes em São Paulo",
    eyebrow: "Exclusividade em São Paulo",
    heroLocation: "São Paulo",
    heroSub:
      "Capital e estado — perfis verificados com filtros por cidade e contato direto via WhatsApp.",
    intro:
      "Catálogo de acompanhantes no estado de São Paulo. Comece pela capital ou filtre no catálogo completo por cidade e bairro.",
    seoHeading: "Acompanhantes de luxo em São Paulo — SP",
    whySection:
      "O estado de São Paulo lidera o volume de buscas no Brasil. O Mulheres oferece curadoria com perfis verificados e navegação por capital e filtros.",
    tags: [
      "acompanhantes são paulo",
      "acompanhantes sp",
      "acompanhantes capital sp",
    ],
    capitalCitySlug: "sao-paulo",
    faq: [
      {
        question: "Como buscar acompanhantes no estado de São Paulo?",
        answer:
          "Acesse a página da capital ou o catálogo filtrado por São Paulo. Perfis verificados com WhatsApp direto.",
      },
    ],
  },
  {
    stateSlug: "rio-de-janeiro",
    region: "Rio de Janeiro",
    uf: "RJ",
    title: "Acompanhantes no Rio de Janeiro",
    eyebrow: "Exclusividade no Rio de Janeiro",
    heroLocation: "Rio de Janeiro",
    heroSub:
      "Estado e capital — Copacabana, Barra e região com perfis verificados e contato direto.",
    intro:
      "Acompanhantes no estado do Rio de Janeiro. Explore a capital ou filtre no catálogo por cidade e bairro.",
    seoHeading: "Acompanhantes de luxo no Rio de Janeiro — RJ",
    whySection:
      "O Rio une turismo e vida urbana com alta demanda. O Mulheres organiza perfis verificados com filtros claros e WhatsApp direto.",
    tags: [
      "acompanhantes rio de janeiro",
      "acompanhantes rj",
      "acompanhantes estado do rio",
    ],
    capitalCitySlug: "rio-de-janeiro",
    faq: [
      {
        question: "Onde achar acompanhantes no estado do Rio?",
        answer:
          "No Mulheres, comece pela capital ou use o catálogo com filtro Rio de Janeiro. Contato direto via WhatsApp.",
      },
    ],
  },
  {
    stateSlug: "parana",
    region: "Paraná",
    uf: "PR",
    title: "Acompanhantes no Paraná",
    eyebrow: "Exclusividade no Paraná",
    heroLocation: "Paraná",
    heroSub:
      "Curitiba e o estado — perfis verificados com discrição e atendimento de alto nível.",
    intro:
      "Catálogo de acompanhantes no Paraná, com Curitiba como hub principal. Perfis verificados e contato via WhatsApp.",
    seoHeading: "Acompanhantes de luxo no Paraná — PR",
    whySection:
      "O Paraná busca qualidade e discrição. O Mulheres reúne acompanhantes verificadas com filtros por cidade e serviços.",
    tags: ["acompanhantes paraná", "acompanhantes pr", "acompanhantes curitiba"],
    capitalCitySlug: "curitiba",
    faq: [
      {
        question: "Tem acompanhantes no Paraná no Mulheres?",
        answer:
          "Sim. Curitiba é o hub principal; use o catálogo para filtrar por Paraná e comparar perfis verificados.",
      },
    ],
  },
  {
    stateSlug: "distrito-federal",
    region: "Distrito Federal",
    uf: "DF",
    title: "Acompanhantes no Distrito Federal",
    eyebrow: "Exclusividade no Distrito Federal",
    heroLocation: "Distrito Federal",
    heroSub:
      "Brasília e o DF — perfis para eventos e encontros discretos com contato direto.",
    intro:
      "Acompanhantes no Distrito Federal com foco em Brasília. Perfis verificados, filtros e WhatsApp direto.",
    seoHeading: "Acompanhantes de luxo no Distrito Federal — DF",
    whySection:
      "O DF concentra demanda corporativa e encontros discretos. O Mulheres oferece perfis verificados e navegação clara por Brasília.",
    tags: [
      "acompanhantes distrito federal",
      "acompanhantes df",
      "acompanhantes brasília",
    ],
    capitalCitySlug: "brasilia",
    faq: [
      {
        question: "Como encontrar acompanhantes no DF?",
        answer:
          "Acesse a página de Brasília ou o catálogo filtrado por Distrito Federal. Perfis com WhatsApp para contato direto.",
      },
    ],
  },
  {
    stateSlug: "bahia",
    region: "Bahia",
    uf: "BA",
    title: "Acompanhantes na Bahia",
    eyebrow: "Exclusividade na Bahia",
    heroLocation: "Bahia",
    heroSub:
      "Salvador e o estado — perfis verificados com charme baiano e contato direto.",
    intro:
      "Catálogo de acompanhantes na Bahia, com Salvador como hub. Perfis verificados e contato via WhatsApp.",
    seoHeading: "Acompanhantes de luxo na Bahia — BA",
    whySection:
      "A Bahia une turismo e vida noturna. O Mulheres lista acompanhantes verificadas com filtros por cidade e serviços.",
    tags: ["acompanhantes bahia", "acompanhantes ba", "acompanhantes salvador"],
    capitalCitySlug: "salvador",
    faq: [
      {
        question: "Onde buscar acompanhantes na Bahia?",
        answer:
          "No Mulheres, comece por Salvador ou filtre o catálogo por Bahia. Contato direto via WhatsApp.",
      },
    ],
  },
];

export function getCityHub(
  stateSlug: string,
  citySlug: string,
): CityHub | undefined {
  return CITY_HUBS.find(
    (h) => h.stateSlug === stateSlug && h.citySlug === citySlug,
  );
}

export function getStateHub(stateSlug: string): StateHub | undefined {
  return STATE_HUBS.find((h) => h.stateSlug === stateSlug);
}

export function getCityHubsByState(stateSlug: string): CityHub[] {
  return CITY_HUBS.filter((h) => h.stateSlug === stateSlug);
}

export function getNeighborhoodHub(
  stateSlug: string,
  citySlug: string,
  neighborhoodSlug: string,
): NeighborhoodHub | undefined {
  const city = getCityHub(stateSlug, citySlug);
  return city?.neighborhoods.find((n) => n.slug === neighborhoodSlug);
}

export function cityHubPath(hub: CityHub): string {
  return `/${hub.stateSlug}/${hub.citySlug}`;
}

export function stateHubPath(hub: StateHub): string {
  return `/${hub.stateSlug}`;
}

export function neighborhoodHubPath(
  hub: CityHub,
  neighborhood: NeighborhoodHub,
): string {
  return `/${hub.stateSlug}/${hub.citySlug}/${neighborhood.slug}`;
}

export function getNeighborhoodCompanions(
  companions: Companion[],
  city: string,
  neighborhood: string,
) {
  return companions.filter(
    (c) =>
      c.city.toLowerCase() === city.toLowerCase() &&
      c.neighborhood.toLowerCase() === neighborhood.toLowerCase(),
  );
}

export function neighborhoodSlugFromName(name: string): string {
  return slugify(name);
}

export function getPublishedNeighborhoodHubs(
  hub: CityHub,
  cityCompanions: Companion[],
): NeighborhoodHub[] {
  return hub.neighborhoods.filter((n) =>
    cityCompanions.some(
      (c) => c.neighborhood.toLowerCase() === n.name.toLowerCase(),
    ),
  );
}

/** Slugs de estado conhecidos — para validar rotas dinâmicas e tema luxury. */
export const STATE_SLUGS = STATE_HUBS.map((h) => h.stateSlug);

export function isKnownStateSlug(slug: string): boolean {
  return STATE_SLUGS.includes(slug);
}
