import type { Companion } from "@/lib/types";
import {
  CITY_HUBS,
  cityHubPath,
  neighborhoodHubPath,
} from "@/lib/location-hubs";

export type CompanionBreadcrumbItem = {
  label: string;
  href: string;
};

/** Trilha de navegação do perfil (UI e JSON-LD). */
export function buildCompanionBreadcrumb(
  companion: Companion,
): CompanionBreadcrumbItem[] {
  const cityHub = CITY_HUBS.find(
    (h) => h.region === companion.region && h.city === companion.city,
  );

  const neighborhood = cityHub?.neighborhoods.find(
    (n) => n.name.toLowerCase() === companion.neighborhood.toLowerCase(),
  );

  const items: CompanionBreadcrumbItem[] = [
    { label: "Início", href: "/" },
    { label: "As modelos", href: "/acompanhantes" },
  ];

  const citySameAsRegion =
    companion.city.trim().toLowerCase() ===
    companion.region.trim().toLowerCase();

  if (!citySameAsRegion) {
    items.push({
      label: companion.region,
      href: `/acompanhantes?region=${encodeURIComponent(companion.region)}`,
    });
  }

  items.push({
    label: companion.city,
    href: cityHub
      ? cityHubPath(cityHub)
      : `/acompanhantes?region=${encodeURIComponent(companion.region)}&search=${encodeURIComponent(companion.city)}`,
  });

  if (companion.neighborhood) {
    items.push({
      label: companion.neighborhood,
      href:
        cityHub && neighborhood
          ? neighborhoodHubPath(cityHub, neighborhood)
          : `/acompanhantes?region=${encodeURIComponent(companion.region)}&city=${encodeURIComponent(companion.city)}&neighborhood=${encodeURIComponent(companion.neighborhood)}`,
    });
  }

  return items;
}
