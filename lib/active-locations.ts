import {
  buildPublishedLocationIndex,
  type PublishedLocationIndex,
} from "@/lib/dynamic-location-hubs";
import { getPublishedCompanions } from "@/lib/listings";
import {
  CITY_HUBS,
  cityHubPath,
  STATE_HUBS,
  stateHubPath,
  type CityHub,
  type StateHub,
} from "@/lib/location-hubs";

export type ActiveCityLink = {
  name: string;
  shortName: string;
  href: string;
  city: string;
  region: string;
};

export type ActiveStateLink = {
  name: string;
  uf: string;
  href: string;
  region: string;
  stateSlug: string;
};

export type ActiveLocationLinks = {
  cities: ActiveCityLink[];
  states: ActiveStateLink[];
  index: PublishedLocationIndex;
};

function cityLinkFromHub(hub: CityHub): ActiveCityLink {
  return {
    name: hub.city,
    shortName: hub.shortName,
    href: cityHubPath(hub),
    city: hub.city,
    region: hub.region,
  };
}

function stateLinkFromHub(hub: StateHub): ActiveStateLink {
  return {
    name: hub.region,
    uf: hub.uf,
    href: stateHubPath(hub),
    region: hub.region,
    stateSlug: hub.stateSlug,
  };
}

/** Cidades e estados com pelo menos um anúncio publicado. */
export async function getActiveLocationLinks(): Promise<ActiveLocationLinks> {
  const companions = await getPublishedCompanions().catch(() => []);
  const index = buildPublishedLocationIndex(companions);

  const cities = index.cities.map((entry) => cityLinkFromHub(entry.hub));

  const activeRegions = new Set(index.cities.map((c) => c.region));
  const states = STATE_HUBS.filter((hub) =>
    activeRegions.has(hub.region),
  ).map(stateLinkFromHub);

  return { cities, states, index };
}

/** Frase "A, B e C" a partir dos nomes de cidades ativas. */
export function formatCityNamesPhrase(cities: ActiveCityLink[]): string {
  const names = cities.map((c) => c.shortName || c.name);
  if (names.length === 0) return "todo o Brasil";
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

/** Hubs estáticos de cidade que têm anúncios (para listas que preferem só capitais cadastradas). */
export function filterStaticCityHubsWithListings(
  index: PublishedLocationIndex,
): CityHub[] {
  const activeKeys = new Set(
    index.cities.map((c) => `${c.stateSlug}/${c.citySlug}`),
  );
  return CITY_HUBS.filter((hub) =>
    activeKeys.has(`${hub.stateSlug}/${hub.citySlug}`),
  );
}

export function filterStateHubsWithListings(
  index: PublishedLocationIndex,
): StateHub[] {
  const activeRegions = new Set(index.cities.map((c) => c.region));
  return STATE_HUBS.filter((hub) => activeRegions.has(hub.region));
}
