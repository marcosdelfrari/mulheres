import type { CatalogFilters, Companion, Region } from "./types";
import { DEFAULT_CATALOG_FILTERS } from "./types";
import { getDistanceKm } from "./geo";
import type { Coordinates } from "./types";

function matchesAnySelected(selected: string[], values: string[]): boolean {
  if (selected.length === 0) return true;
  return selected.some((item) => values.includes(item));
}

export function filterCompanions(
  items: Companion[],
  filters: CatalogFilters,
  userLocation?: Coordinates | null,
): { companion: Companion; distanceKm?: number }[] {
  const result = items.filter((c) => {
    if (filters.region !== "all" && c.region !== filters.region) return false;
    if (filters.city && c.city !== filters.city) return false;
    if (filters.neighborhood !== "all" && c.neighborhood !== filters.neighborhood)
      return false;
    if (filters.verifiedOnly && !c.verified) return false;
    if (filters.maxPrice && c.pricePerHour > filters.maxPrice) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack =
        `${c.name} ${c.city} ${c.neighborhood} ${c.region}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (!matchesAnySelected(filters.selectedServices, c.services)) return false;
    if (!matchesAnySelected(filters.selectedServicesFor, c.servicesFor))
      return false;
    if (!matchesAnySelected(filters.selectedLocations, c.serviceLocations))
      return false;
    if (
      filters.selectedGenders.length > 0 &&
      !filters.selectedGenders.includes(c.gender ?? "Mulher")
    ) {
      return false;
    }
    return true;
  });

  const withDistance = result.map((c) => ({
    companion: c,
    distanceKm: userLocation
      ? getDistanceKm(userLocation, {
          latitude: c.latitude,
          longitude: c.longitude,
        })
      : undefined,
  }));

  withDistance.sort((a, b) => {
    switch (filters.sortBy) {
      case "distance":
        if (!userLocation) return 0;
        return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
      case "price-asc":
        return a.companion.pricePerHour - b.companion.pricePerHour;
      case "price-desc":
        return b.companion.pricePerHour - a.companion.pricePerHour;
      case "rating":
        return b.companion.rating - a.companion.rating;
      default:
        return 0;
    }
  });

  return withDistance;
}

export function parseCatalogSearchParams(
  params: Record<string, string | string[] | undefined>,
): CatalogFilters {
  const get = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : "";
  };

  const region = get("region");
  const search = get("search");
  const city = get("city");
  const neighborhood = get("neighborhood");

  return {
    ...DEFAULT_CATALOG_FILTERS,
    ...(region && region !== "all"
      ? { region: region as Region }
      : {}),
    ...(search ? { search } : {}),
    ...(city ? { city } : {}),
    ...(neighborhood && neighborhood !== "all"
      ? { neighborhood }
      : {}),
    ...(get("verified") === "1" ? { verifiedOnly: true } : {}),
  };
}

export function getCatalogHeading(filters: CatalogFilters): {
  title: string;
  description: string;
} {
  if (filters.neighborhood !== "all" && filters.city) {
    return {
      title: `Acompanhantes em ${filters.neighborhood}, ${filters.city}`,
      description: `Encontre acompanhantes verificadas em ${filters.neighborhood}, ${filters.city}. Perfis com fotos reais e contato direto via WhatsApp.`,
    };
  }

  if (filters.search && filters.region !== "all") {
    return {
      title: `Acompanhantes em ${filters.search}, ${filters.region}`,
      description: `Modelos e acompanhantes em ${filters.search}. Filtros por bairro, preço e serviços. Contato direto via WhatsApp.`,
    };
  }

  if (filters.search) {
    return {
      title: `Acompanhantes em ${filters.search}`,
      description: `Encontre acompanhantes em ${filters.search} com perfis verificados, fotos e contato via WhatsApp.`,
    };
  }

  if (filters.region !== "all") {
    return {
      title: `Acompanhantes em ${filters.region}`,
      description: `Explore as modelos em ${filters.region}. Filtre por cidade, bairro, preço e serviços.`,
    };
  }

  return {
    title: "As modelos em todo o Brasil",
    description:
      "Explore todas as modelos. Filtre por região, cidade, bairro, preço e serviços.",
  };
}

export function catalogFiltersToSearchParams(
  filters: CatalogFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.region !== "all") params.set("region", filters.region);
  if (filters.search) params.set("search", filters.search);
  if (filters.city) params.set("city", filters.city);
  if (filters.neighborhood !== "all")
    params.set("neighborhood", filters.neighborhood);
  if (filters.verifiedOnly) params.set("verified", "1");
  return params;
}
