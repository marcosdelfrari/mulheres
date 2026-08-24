import { FILTER_TYPE_TAGS } from "@/lib/catalog-locations";
import type { Companion, Region } from "@/lib/types";
import { slugify } from "@/lib/slug";
import type { CityHub, NeighborhoodHub, StateHub } from "@/lib/location-hubs";
import {
  CITY_HUBS,
  getCityHub,
  getNeighborhoodHub,
  STATE_HUBS,
} from "@/lib/location-hubs";
import { absoluteUrl } from "@/lib/seo";

const REGION_TO_STATE = Object.fromEntries(
  STATE_HUBS.map((hub) => [hub.region, hub]),
) as Record<Region, StateHub>;

const CITY_SHORT_NAMES: Record<string, string> = {
  "Belo Horizonte": "BH",
  "Rio de Janeiro": "Rio",
  "São Paulo": "SP",
  Salvador: "Salvador",
  Curitiba: "Curitiba",
  Brasília: "Brasília",
};

export function regionToStateHub(region: string): StateHub | undefined {
  return REGION_TO_STATE[region as Region];
}

export function cityShortName(city: string): string {
  return CITY_SHORT_NAMES[city] ?? city.split(" ")[0] ?? city;
}

export function typeTagSlug(tag: string): string {
  return slugify(tag);
}

export function typeTagFromSlug(slug: string): string | undefined {
  return FILTER_TYPE_TAGS.find((tag) => typeTagSlug(tag) === slug);
}

export function comLocalPath(hub: Pick<CityHub, "stateSlug" | "citySlug">): string {
  return `/${hub.stateSlug}/${hub.citySlug}/com-local`;
}

export function typeTagHubPath(
  hub: Pick<CityHub, "stateSlug" | "citySlug">,
  tag: string,
): string {
  return `/${hub.stateSlug}/${hub.citySlug}/tipo/${typeTagSlug(tag)}`;
}

function buildCityTags(city: string, stateHub: StateHub): string[] {
  const cityLower = city.toLowerCase();
  const short = cityShortName(city).toLowerCase();
  const tags = [
    `acompanhantes ${cityLower}`,
    `acompanhantes ${short}`,
    `acompanhantes ${stateHub.uf.toLowerCase()}`,
    `acompanhantes com local ${cityLower}`,
  ];
  if (city === "Salvador") {
    tags.push(
      "mulheres de programa salvador",
      "acompanhante em salvador",
      "acompanhante mulher em salvador",
    );
  }
  if (city === "Belo Horizonte") {
    tags.push("acompanhantes bh", "acompanhantes de luxo mg");
  }
  if (city === "Rio de Janeiro") {
    tags.push("acompanhantes rh");
  }
  return tags;
}

function buildCityFaq(city: string, shortName: string, uf: string) {
  const faqs: { question: string; answer: string }[] = [];

  if (city === "Salvador") {
    faqs.push({
      question: "Onde encontrar mulheres de programa em Salvador?",
      answer:
        "No Mulheres você encontra acompanhantes e mulheres de programa em Salvador com perfis verificados, fotos reais e contato direto via WhatsApp — sem intermediários.",
    });
  }

  faqs.push(
    {
      question: `Onde encontrar acompanhantes em ${city}?`,
      answer: `No Mulheres você encontra acompanhantes em ${city} com perfis verificados, fotos reais e contato direto via WhatsApp. Filtre por bairro, preço e serviços.`,
    },
    {
      question: `Tem acompanhantes com local em ${city}?`,
      answer: `Sim. Vários perfis em ${city} indicam atendimento com local próprio, além de hotel, motel e deslocamento. Veja a página com local ou confira cada anúncio.`,
    },
    {
      question: `Quais bairros de ${city} têm acompanhantes no catálogo?`,
      answer: `O Mulheres lista acompanhantes nos bairros com anúncios ativos em ${city}. Use as páginas por bairro ou os filtros do catálogo para refinar a busca.`,
    },
    {
      question: `Como entrar em contato com uma acompanhante em ${shortName}?`,
      answer:
        "Cada perfil exibe WhatsApp e telefone para contato direto. Perfis verificados passam por checagem de identidade. Combine valores, horários e local antes do encontro.",
    },
    {
      question: `O Mulheres é seguro para encontrar acompanhantes em ${shortName}?`,
      answer:
        "Sim. Perfis verificados passam por checagem de identidade, fotos reais e contato direto via WhatsApp — sem intermediários. Combine valores, horários e local antes do encontro.",
    },
    {
      question: `Qual site é mais seguro para encontrar acompanhantes em ${city}?`,
      answer: `O Mulheres verifica identidade dos perfis, exibe fotos reais e permite contato direto via WhatsApp — sem taxas ocultas. Veja ${absoluteUrl("/guias/site-seguro-acompanhantes")} ou explore perfis verificados em ${city}.`,
    },
  );

  return faqs;
}

function faqQuestionKey(question: string): string {
  return question.toLowerCase().replace(/\s+/g, " ").trim();
}

function mergeFaqs(
  primary: readonly { question: string; answer: string }[],
  extra: { question: string; answer: string }[],
): { question: string; answer: string }[] {
  const seen = new Set(primary.map((f) => faqQuestionKey(f.question)));
  const merged = [...primary];
  for (const faq of extra) {
    const key = faqQuestionKey(faq.question);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(faq);
    }
  }
  return merged;
}

/** Enriquece hubs estáticos com tags e FAQs dinâmicos (com local, site seguro, sinônimos). */
export function enrichCityHub(hub: CityHub): CityHub {
  const stateHub = STATE_HUBS.find((s) => s.stateSlug === hub.stateSlug);
  if (!stateHub) return hub;

  const extraTags = buildCityTags(hub.city, stateHub);
  const tags = [...new Set([...hub.tags, ...extraTags])];
  const extraFaqs = buildCityFaq(hub.city, hub.shortName, stateHub.uf);

  return {
    ...hub,
    tags,
    faq: mergeFaqs(hub.faq, extraFaqs),
  };
}

export function buildDynamicCityHub(stateHub: StateHub, city: string): CityHub {
  const citySlug = slugify(city);
  const shortName = cityShortName(city);

  return {
    stateSlug: stateHub.stateSlug,
    citySlug,
    city,
    region: stateHub.region,
    shortName,
    title: `Acompanhantes em ${city}, ${stateHub.uf}`,
    eyebrow: `Exclusividade em ${stateHub.region}`,
    heroLocation: city,
    heroSub: `Perfis verificados em ${city} com contato direto via WhatsApp — sem intermediários.`,
    intro: `Encontre acompanhantes em ${city} com perfis verificados, fotos reais e contato direto via WhatsApp. Filtre por bairro, tipo, com local e serviços.`,
    seoHeading: `Acompanhantes de luxo em ${city} — ${stateHub.uf}`,
    whySection: `${city} concentra buscas por acompanhantes verificadas. O Mulheres reúne perfis com filtros por bairro, tipo e local de atendimento — contato direto via WhatsApp.`,
    tags: buildCityTags(city, stateHub),
    faq: buildCityFaq(city, shortName, stateHub.uf),
    neighborhoods: [],
  };
}

export function buildDynamicNeighborhoodHub(
  hub: CityHub,
  name: string,
): NeighborhoodHub {
  return {
    slug: slugify(name),
    name,
    intro: `Encontre acompanhantes em ${name}, ${hub.city}. Perfis verificados no Mulheres com contato direto via WhatsApp.`,
    faq: [
      {
        question: `Onde encontrar acompanhantes em ${name}, ${hub.shortName}?`,
        answer: `No Mulheres você encontra acompanhantes em ${name}, ${hub.city} com perfis verificados, fotos reais e contato direto via WhatsApp.`,
      },
      {
        question: `Tem acompanhantes com local em ${name}, ${hub.city}?`,
        answer: `Sim. Vários perfis em ${name} indicam atendimento com local próprio, hotel ou deslocamento. Confira cada anúncio antes de combinar.`,
      },
      {
        question: `Acompanhantes em ${name} atendem em hotel?`,
        answer: `Sim. Muitas acompanhantes em ${name} atendem em hotel, motel e com deslocamento. Cada perfil indica os locais disponíveis.`,
      },
    ],
  };
}

export function findCityNameInRegion(
  companions: Companion[],
  region: Region,
  citySlug: string,
): string | undefined {
  const cities = [
    ...new Set(
      companions
        .filter((c) => c.region === region)
        .map((c) => c.city)
        .filter(Boolean),
    ),
  ];
  return cities.find((city) => slugify(city) === citySlug);
}

export function resolveCityHubFromData(
  estado: string,
  cidade: string,
  companions: Companion[],
): CityHub | undefined {
  const staticHub = getCityHub(estado, cidade);
  if (staticHub) return enrichCityHub(staticHub);

  const stateHub = STATE_HUBS.find((hub) => hub.stateSlug === estado);
  if (!stateHub) return undefined;

  const cityName = findCityNameInRegion(companions, stateHub.region, cidade);
  if (!cityName) return undefined;

  return enrichCityHub(buildDynamicCityHub(stateHub, cityName));
}

export function resolveNeighborhoodHubFromData(
  hub: CityHub,
  bairroSlug: string,
  companions: Companion[],
): NeighborhoodHub | undefined {
  const staticNeighborhood = getNeighborhoodHub(
    hub.stateSlug,
    hub.citySlug,
    bairroSlug,
  );
  if (staticNeighborhood) return staticNeighborhood;

  const cityCompanions = companions.filter(
    (c) => c.city.toLowerCase() === hub.city.toLowerCase(),
  );
  const names = [
    ...new Set(cityCompanions.map((c) => c.neighborhood).filter(Boolean)),
  ];
  const match = names.find((name) => slugify(name) === bairroSlug);
  return match ? buildDynamicNeighborhoodHub(hub, match) : undefined;
}

export function getNeighborhoodsForCity(
  hub: CityHub,
  cityCompanions: Companion[],
): NeighborhoodHub[] {
  const staticHub = getCityHub(hub.stateSlug, hub.citySlug);
  const staticList = staticHub?.neighborhoods ?? [];
  const staticNames = new Set(staticList.map((n) => n.name.toLowerCase()));

  const publishedStatic = staticList.filter((n) =>
    cityCompanions.some(
      (c) => c.neighborhood.toLowerCase() === n.name.toLowerCase(),
    ),
  );

  const dynamic = [
    ...new Set(cityCompanions.map((c) => c.neighborhood).filter(Boolean)),
  ]
    .filter((name) => !staticNames.has(name.toLowerCase()))
    .map((name) => buildDynamicNeighborhoodHub(hub, name))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return [...publishedStatic, ...dynamic];
}

export function companionHasLocal(companion: Companion): boolean {
  return companion.serviceLocations.includes("Em casa");
}

export function getTypeTagsInCity(companions: Companion[]): string[] {
  const tags = new Set<string>();
  for (const companion of companions) {
    for (const tag of companion.typeTags ?? []) {
      tags.add(tag);
    }
  }
  return FILTER_TYPE_TAGS.filter((tag) => tags.has(tag)).concat(
    [...tags].filter((tag) => !FILTER_TYPE_TAGS.includes(tag)).sort(),
  );
}

export interface PublishedLocationIndex {
  companions: Companion[];
  cities: Array<{
    stateSlug: string;
    citySlug: string;
    city: string;
    region: Region;
    hub: CityHub;
    companions: Companion[];
    neighborhoods: NeighborhoodHub[];
    withLocalCount: number;
    typeTags: string[];
  }>;
}

export function buildPublishedLocationIndex(
  companions: Companion[],
): PublishedLocationIndex {
  const cityMap = new Map<
    string,
    {
      stateSlug: string;
      citySlug: string;
      city: string;
      region: Region;
      hub: CityHub;
      companions: Companion[];
    }
  >();

  for (const companion of companions) {
    const stateHub = regionToStateHub(companion.region);
    if (!stateHub) continue;

    const citySlug = slugify(companion.city);
    const key = `${stateHub.stateSlug}/${citySlug}`;
    const existing = cityMap.get(key);
    if (existing) {
      existing.companions.push(companion);
      continue;
    }

    const staticHub = getCityHub(stateHub.stateSlug, citySlug);
    const hub = enrichCityHub(
      staticHub ?? buildDynamicCityHub(stateHub, companion.city),
    );

    cityMap.set(key, {
      stateSlug: stateHub.stateSlug,
      citySlug,
      city: companion.city,
      region: companion.region,
      hub,
      companions: [companion],
    });
  }

  const cities = [...cityMap.values()]
    .map((entry) => {
      const neighborhoods = getNeighborhoodsForCity(
        entry.hub,
        entry.companions,
      );
      return {
        ...entry,
        neighborhoods,
        withLocalCount: entry.companions.filter(companionHasLocal).length,
        typeTags: getTypeTagsInCity(entry.companions),
      };
    })
    .sort((a, b) => a.city.localeCompare(b.city, "pt-BR"));

  return { companions, cities };
}

/** Cidades com hub estático + cidades com anúncios publicados. */
export function allCityHubKeys(
  index: PublishedLocationIndex,
): Array<{ estado: string; cidade: string }> {
  const keys = new Map<string, { estado: string; cidade: string }>();

  for (const hub of CITY_HUBS) {
    keys.set(`${hub.stateSlug}/${hub.citySlug}`, {
      estado: hub.stateSlug,
      cidade: hub.citySlug,
    });
  }

  for (const city of index.cities) {
    keys.set(`${city.stateSlug}/${city.citySlug}`, {
      estado: city.stateSlug,
      cidade: city.citySlug,
    });
  }

  return [...keys.values()];
}

export function citiesWithListingsInRegion(
  companions: Companion[],
  region: Region,
): string[] {
  return [
    ...new Set(
      companions.filter((c) => c.region === region).map((c) => c.city),
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function cityHubPathFromSlugs(stateSlug: string, citySlug: string): string {
  return `/${stateSlug}/${citySlug}`;
}
