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
  title: string;
  intro: string;
  faq: readonly { question: string; answer: string }[];
  neighborhoods: NeighborhoodHub[];
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
    title: "Acompanhantes em Belo Horizonte, MG",
    intro: `Encontre acompanhantes de luxo em BH com perfis verificados, fotos reais e contato direto via WhatsApp. Para quem já usa ${ALTERNATIVES_TEXT}, o Mulheres oferece filtros por bairro, distância e serviços.`,
    faq: [
      {
        question: "Onde encontrar acompanhantes de luxo em Belo Horizonte?",
        answer:
          "No Mulheres você encontra acompanhantes em Belo Horizonte com perfis verificados, fotos reais e contato direto via WhatsApp. Filtre por bairro como Savassi, Lourdes, Funcionários e Pampulha.",
      },
      {
        question: "Quais bairros de BH têm acompanhantes no Mulheres?",
        answer:
          "Savassi, Lourdes, Funcionários, Centro, Pampulha, Buritis e outros. Use as páginas de bairro ou os filtros do catálogo.",
      },
    ],
    neighborhoods: BH_NEIGHBORHOOD_HUBS,
  },
  {
    stateSlug: "sao-paulo",
    citySlug: "sao-paulo",
    city: "São Paulo",
    region: "São Paulo",
    title: "Acompanhantes em São Paulo, SP",
    intro:
      "Catálogo de acompanhantes em São Paulo com perfis verificados. Pinheiros, Moema, Vila Madalena e toda a capital paulista. Contato direto via WhatsApp.",
    faq: [
      {
        question: "Onde encontrar acompanhantes em São Paulo?",
        answer:
          "No Mulheres você encontra acompanhantes em São Paulo com perfis verificados, filtros por bairro e contato direto via WhatsApp.",
      },
    ],
    neighborhoods: [],
  },
  {
    stateSlug: "rio-de-janeiro",
    citySlug: "rio-de-janeiro",
    city: "Rio de Janeiro",
    region: "Rio de Janeiro",
    title: "Acompanhantes no Rio de Janeiro, RJ",
    intro:
      "Acompanhantes no Rio de Janeiro — Copacabana, Barra da Tijuca e Zona Sul. Perfis verificados com fotos e contato direto.",
    faq: [
      {
        question: "Como encontrar acompanhantes no Rio de Janeiro?",
        answer:
          "Navegue pelo catálogo Mulheres filtrado para o Rio de Janeiro. Perfis verificados com preços, serviços e WhatsApp.",
      },
    ],
    neighborhoods: [],
  },
  {
    stateSlug: "parana",
    citySlug: "curitiba",
    city: "Curitiba",
    region: "Paraná",
    title: "Acompanhantes em Curitiba, PR",
    intro:
      "Acompanhantes em Curitiba com atendimento sofisticado no Batel e região. Perfis verificados no Mulheres.",
    faq: [
      {
        question: "Tem acompanhantes em Curitiba no Mulheres?",
        answer:
          "Sim. O Mulheres lista acompanhantes em Curitiba com perfis verificados e contato direto via WhatsApp.",
      },
    ],
    neighborhoods: [],
  },
  {
    stateSlug: "distrito-federal",
    citySlug: "brasilia",
    city: "Brasília",
    region: "Distrito Federal",
    title: "Acompanhantes em Brasília, DF",
    intro:
      "Acompanhantes em Brasília para eventos corporativos e encontros discretos. Asa Sul e região administrativa.",
    faq: [
      {
        question: "Onde encontrar acompanhantes em Brasília?",
        answer:
          "No Mulheres você encontra acompanhantes em Brasília com perfis verificados e contato direto.",
      },
    ],
    neighborhoods: [],
  },
  {
    stateSlug: "bahia",
    citySlug: "salvador",
    city: "Salvador",
    region: "Bahia",
    title: "Acompanhantes em Salvador, BA",
    intro:
      "Acompanhantes em Salvador com charme baiano. Barra e região metropolitana com perfis verificados.",
    faq: [
      {
        question: "Como encontrar acompanhantes em Salvador?",
        answer:
          "Acesse o catálogo Mulheres para Salvador. Perfis com fotos, preços e WhatsApp para contato direto.",
      },
    ],
    neighborhoods: [],
  },
];

export function getCityHub(stateSlug: string, citySlug: string): CityHub | undefined {
  return CITY_HUBS.find(
    (h) => h.stateSlug === stateSlug && h.citySlug === citySlug,
  );
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
