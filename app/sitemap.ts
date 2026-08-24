import type { MetadataRoute } from "next";
import { filterStateHubsWithListings } from "@/lib/active-locations";
import { buildCompanionSlug } from "@/lib/companion-utils";
import {
  buildPublishedLocationIndex,
  comLocalPath,
  typeTagHubPath,
} from "@/lib/dynamic-location-hubs";
import {
  cityHubPath,
  getNeighborhoodCompanions,
  neighborhoodHubPath,
  stateHubPath,
} from "@/lib/location-hubs";
import { getPublishedCompanions } from "@/lib/listings";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const companions = await getPublishedCompanions().catch(() => []);
  const index = buildPublishedLocationIndex(companions);
  const activeStates = filterStateHubsWithListings(index);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/acompanhantes"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/guias/como-funciona"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/guias/alternativas-em-bh"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: absoluteUrl("/guias/site-seguro-acompanhantes"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.72,
    },
    {
      url: absoluteUrl("/privacidade"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/termos"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/mais-de-18"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const statePages: MetadataRoute.Sitemap = activeStates.map((hub) => ({
    url: absoluteUrl(stateHubPath(hub)),
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.88,
  }));

  const cityPages: MetadataRoute.Sitemap = index.cities.map((city) => ({
    url: absoluteUrl(cityHubPath(city.hub)),
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: city.city === "Belo Horizonte" ? 0.95 : 0.8,
  }));

  const neighborhoodPages: MetadataRoute.Sitemap = index.cities.flatMap(
    (city) =>
      city.neighborhoods
        .filter(
          (n) =>
            getNeighborhoodCompanions(city.companions, city.city, n.name)
              .length >= 1,
        )
        .map((n) => ({
          url: absoluteUrl(neighborhoodHubPath(city.hub, n)),
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.85,
        })),
  );

  const comLocalPages: MetadataRoute.Sitemap = index.cities
    .filter((city) => city.withLocalCount > 0)
    .map((city) => ({
      url: absoluteUrl(comLocalPath(city.hub)),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.82,
    }));

  const typeTagPages: MetadataRoute.Sitemap = index.cities.flatMap((city) =>
    city.typeTags.map((tag) => ({
      url: absoluteUrl(typeTagHubPath(city.hub, tag)),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.78,
    })),
  );

  const profilePages: MetadataRoute.Sitemap = companions.map((c) => ({
    url: absoluteUrl(`/acompanhante/${buildCompanionSlug(c)}`),
    lastModified: new Date(c.publishedAt),
    changeFrequency: "weekly" as const,
    priority: c.verified
      ? c.city === "Belo Horizonte"
        ? 0.7
        : 0.55
      : 0.45,
  }));

  return [
    ...staticPages,
    ...statePages,
    ...cityPages,
    ...neighborhoodPages,
    ...comLocalPages,
    ...typeTagPages,
    ...profilePages,
  ];
}
