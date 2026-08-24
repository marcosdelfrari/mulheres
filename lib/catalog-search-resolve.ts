import {
  BH_NEIGHBORHOOD_HUBS,
  CITY_HUBS,
  cityHubPath,
  findCityHubBySearch,
  neighborhoodHubPath,
} from "@/lib/location-hubs";
import { slugify } from "@/lib/slug";

export type ResolvedCatalogSearch =
  | {
      kind: "neighborhood";
      name: string;
      city: string;
      shortCity: string;
      hubPath: string;
    }
  | {
      kind: "city";
      title: string;
      description: string;
      hubPath: string;
    }
  | {
      kind: "raw";
      query: string;
    };

function neighborhoodPreposition(name: string): "no" | "em" {
  return name.toLowerCase() === "centro" ? "no" : "em";
}

function formatNeighborhoodTitle(name: string, shortCity: string): string {
  const prep = neighborhoodPreposition(name);
  return `Acompanhantes ${prep} ${name}, ${shortCity}`;
}

function formatNeighborhoodDescription(name: string, city: string): string {
  const prep = neighborhoodPreposition(name);
  return `Encontre acompanhantes verificadas ${prep} ${name}, ${city}. Perfis com fotos reais e contato direto via WhatsApp.`;
}

function matchesNeighborhoodAlias(normalized: string, name: string, slug: string) {
  const aliases = new Set([
    slug,
    slugify(name),
    name.toLowerCase(),
    `${slug} bh`,
    `${name.toLowerCase()} bh`,
  ]);
  return aliases.has(normalized);
}

export function resolveCatalogSearch(search: string): ResolvedCatalogSearch {
  const trimmed = search.trim();
  const normalized = trimmed.toLowerCase();
  if (!normalized) return { kind: "raw", query: trimmed };

  const bhHub = CITY_HUBS.find((h) => h.citySlug === "belo-horizonte");
  if (bhHub) {
    for (const neighborhood of BH_NEIGHBORHOOD_HUBS) {
      if (matchesNeighborhoodAlias(normalized, neighborhood.name, neighborhood.slug)) {
        return {
          kind: "neighborhood",
          name: neighborhood.name,
          city: bhHub.city,
          shortCity: bhHub.shortName,
          hubPath: neighborhoodHubPath(bhHub, neighborhood),
        };
      }
    }
  }

  const cityHub = findCityHubBySearch(trimmed);
  if (cityHub) {
    return {
      kind: "city",
      title: cityHub.title,
      description: cityHub.intro,
      hubPath: cityHubPath(cityHub),
    };
  }

  return { kind: "raw", query: trimmed };
}

export function catalogHeadingFromSearch(
  search: string,
  region?: string,
): { title: string; description: string; hubPath?: string } {
  const resolved = resolveCatalogSearch(search);

  if (resolved.kind === "neighborhood") {
    return {
      title: formatNeighborhoodTitle(resolved.name, resolved.shortCity),
      description: formatNeighborhoodDescription(resolved.name, resolved.city),
      hubPath: resolved.hubPath,
    };
  }

  if (resolved.kind === "city") {
    return {
      title: resolved.title,
      description: resolved.description,
      hubPath: resolved.hubPath,
    };
  }

  const query = resolved.query;
  if (region && region !== "all") {
    return {
      title: `Acompanhantes em ${query}, ${region}`,
      description: `Modelos e acompanhantes em ${query}. Filtros por bairro, preço e serviços. Contato direto via WhatsApp.`,
    };
  }

  return {
    title: `Resultados para “${query}”`,
    description: `Encontre acompanhantes relacionadas a “${query}” com perfis verificados, fotos e contato via WhatsApp.`,
  };
}

/** Bairros de BH reconhecidos na busca — para redirects estáticos. */
export const BH_NEIGHBORHOOD_SEARCH_ALIASES = BH_NEIGHBORHOOD_HUBS.flatMap(
  (neighborhood) => [
    { search: neighborhood.slug, slug: neighborhood.slug },
    { search: neighborhood.name, slug: neighborhood.slug },
  ],
);
